<template>
	<div>
		<input
			class="dk-collection-search-input"
			v-model="inputValue"
			:placeholder="placeholder"
			@keyup.enter="onEnter"
			@keydown.down="onDownKey"
			@keydown.up="onUpKey"
		/>
	</div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

// incoming properties
const props = defineProps({
	content: Object,
	uid: String,
	wwElementState: Object
});

// outgoing events
const emit = defineEmits(["trigger-event"]);

// control the debounce
const delay = computed(
	() => wwLib.wwUtils.getLengthUnit(props.content.debounceDelay)[0]
);
let debounceTimeout = null;

// the value of our input + expose it as a component variable + watch for changes in the input and the property
const inputValue = ref("");
inputValue.value = props.content.value;

const currentValue = wwLib.wwVariable.useComponentVariable({
	uid: props.wwElementState.uid,
	name: "Current Value",
	defaultValue: props.content.value,
	type: "text"
});

watch(inputValue, (newVal, _) => {
	if (props.content.debounce) {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		debounceTimeout = setTimeout(() => {
			currentValue.setValue(newVal);

			emit("trigger-event", {
				name: "onChange",
				event: { value: newVal }
			});
		}, delay.value);
	} else {
		emit("trigger-event", { name: "onChange", event: { value: newVal } });
	}
});

watch(
	() => props.content.value,
	(newVal, _) => {
		inputValue.value = newVal;
	}
);

// our placeholder + watch for changes in the property
const placeholder = ref("");
placeholder.value = props.content.placeholder;

watch(
	() => props.content.placeholder,
	(newVal, _) => {
		placeholder.value = newVal;
	}
);

const onEnter = () => {
	emit("trigger-event", {
		name: "onEnterKey",
		event: { value: variableValue.value }
	});
};

const onDownKey = (event) => {
	emit("trigger-event", {
		name: "onDownKey",
		event: { value: variableValue.value }
	});
	event.preventDefault();
	event.stopPropagation();
};

const onUpKey = (event) => {
	emit("trigger-event", {
		name: "onUpKey",
		event: { value: variableValue.value }
	});
	event.preventDefault();
	event.stopPropagation();
};
</script>

<style scoped>
.dk-collection-search-input::placeholder {
	color: var(--theme-placeholder-color);
}
</style>
