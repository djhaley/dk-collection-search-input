import { computed, ref, watch } from 'vue';

export function useInput(props, emit) {
    const isReallyFocused = ref(false);
    const isDebouncing = ref(false);
    const inputRef = ref(null);
    let debounceTimeout = null;

    const type = computed(() => {
        if (Object.keys(props.wwElementState.props).includes('type')) {
            return props.wwElementState.props.type;
        }
        return props.content.type;
    });

    function formatValue(value) {
        if (type.value !== 'decimal') return value;
        if (!value && value !== 0) return '';

        // Convert to string and ensure decimal point is '.'
        value = `${value}`.replace(',', '.');

        // Determine decimal places from precision setting
        // The precision is stored as "0.1", "0.01", etc.
        // Count the zeros after the decimal point to get the precision
        const precisionStr = props.content.precision;
        const decimalPlaces = precisionStr.includes('.') ? precisionStr.split('.')[1].length : 0;

        // Format the number with fixed decimal places
        // We need to return a string to preserve trailing zeros
        return Number(value).toFixed(decimalPlaces);
    }

    const defaultValue = computed(() => (props.content.value === undefined ? '' : formatValue(props.content.value)));
    const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'value',
        defaultValue,
    });

    /** wwEditor:start */
    watch(defaultValue, () => {
        setValue(defaultValue.value);
    });
    /* wwEditor:end */

    const inputType = computed(() => {
        if (!props.content) return 'text';
        if (props.content.type === 'password') {
            return props.content.displayPassword ? 'text' : 'password';
        }
        return props.content.type === 'decimal' ? 'number' : props.content.type;
    });

    const isReadonly = computed(() => {
        /* wwEditor:start */
        if (props.wwEditorState?.isSelected) {
            return props.wwElementState.states.includes('readonly');
        }
        /* wwEditor:end */
        return props.wwElementState.props.readonly === undefined
            ? props.content.readonly
            : props.wwElementState.props.readonly;
    });

    const style = computed(() => {
        const computedStyle = {
            ...wwLib.wwUtils.getTextStyleFromContent(props.content),
            '--placeholder-color': props.content.placeholderColor,
        };
        delete computedStyle['whiteSpaceCollapse'];
        delete computedStyle['whiteSpace'];
        return computedStyle;
    });

    const min = computed(() => {
        if (type.value === 'date') {
            return props.content.minDate;
        }
        return props.content.min;
    });

    const max = computed(() => {
        if (type.value === 'date') {
            return props.content.maxDate;
        }
        return props.content.max;
    });

    const step = computed(() => {
        if (['decimal', 'number'].includes(type.value)) return props.content.step;
        if ('time' === type.value) return props.content.timePrecision || 1;
        return 1;
    });

    const stepAttribute = computed(() => {
        return !isReallyFocused.value && inputType.value === 'number' ? 'any' : step.value;
    });

    const delay = computed(() => wwLib.wwUtils.getLengthUnit(props.content.debounceDelay)[0]);

    function correctDecimalValue(event) {
        if (type.value === 'decimal') {
            const formattedValue = formatValue(variableValue.value);
            if (formattedValue !== variableValue.value) {
                setValue(formattedValue);
                emit('trigger-event', {
                    name: 'change',
                    event: { domEvent: event, value: parseFloat(formattedValue) },
                });
            }
        }
    }

    function handleManualInput(event) {
        const value = event.target.value;
        let newValue;

        if (inputType.value === 'number' && (event.data === '.' || event.data === ',') && value === '') {
            return;
        } else if (inputType.value === 'number' && (value === 0 || (value && value.length))) {
            try {
                newValue = parseFloat(value);
            } catch (error) {
                newValue = value;
            }
        } else {
            newValue = value;
        }

        if (newValue === props.value) return;
        setValue(newValue);

        const parsedValue =
            (inputType.value === 'number' || inputType.value === 'decimal') && typeof newValue === 'string'
                ? parseFloat(newValue)
                : newValue;
        if (props.content.debounce) {
            isDebouncing.value = true;
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            debounceTimeout = setTimeout(() => {
                emit('trigger-event', {
                    name: 'change',
                    event: { domEvent: event, value: parsedValue },
                });
                emit('element-event', { type: 'change', value: { domEvent: event, value: parsedValue } });
                isDebouncing.value = false;
            }, delay.value);
        } else {
            emit('trigger-event', { name: 'change', event: { domEvent: event, value: parsedValue } });
            emit('element-event', { type: 'change', value: { domEvent: event, value: parsedValue } });
        }
    }

    function onBlur(event) {
        correctDecimalValue(event);
        isReallyFocused.value = false;
    }

    function focusInput() {
        if (isReadonly.value) return;
        if (inputRef.value) inputRef.value.focus();
    }

    function selectInput() {
        if (inputRef.value) inputRef.value.select();
    }

    watch(isReallyFocused, (isFocused, wasFocused) => {
        if (isFocused && !wasFocused) {
            emit('trigger-event', { name: 'focus' });
        } else if (!isFocused && wasFocused) {
            emit('trigger-event', { name: 'blur' });
        }
    });

    const isFocused = computed(() => {
        /* wwEditor:start */
        if (props.wwEditorState.isSelected) {
            return props.wwElementState.states.includes('focus');
        }
        /* wwEditor:end */
        return isReallyFocused.value;
    });

    watch(
        isFocused,
        value => {
            if (value) {
                emit('add-state', 'focus');
            } else {
                emit('remove-state', 'focus');
            }
        },
        {
            immediate: true,
        }
    );

    watch(
        isReadonly,
        value => {
            if (value) {
                emit('add-state', 'readonly');
            } else {
                emit('remove-state', 'readonly');
            }
        },
        {
            immediate: true,
        }
    );

    /* wwEditor:start */
    watch(
        () => props.content.precision,
        (newValue, oldValue) => {
            if (newValue === oldValue) return;
            const value = formatValue(variableValue.value);
            setValue(value);
        }
    );
    /* wwEditor:end */

    return {
        inputRef,
        variableValue,
        isReallyFocused,
        isDebouncing,
        type,
        step,
        inputType,
        isReadonly,
        style,
        min,
        max,
        stepAttribute,
        handleManualInput,
        focusInput,
        selectInput,
        onBlur,
        isFocused,
    };
}
