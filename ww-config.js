export default {
	editor: {
		label: { en: "Collection Search Input" },
		icon: "text-input",
		customSettingsPropertiesOrder: [
			"value",
			"placeholder",
			"debounce",
			"debounceDelay"
		]
	},
	triggerEvents: [
		{
			name: "onChange",
			label: { en: "On Change" },
			event: { value: "" },
			default: true
		},
		{
			name: "onEnterKey",
			label: { en: "On enter key" },
			event: { value: "" }
		},
		{
			name: "onDownKey",
			label: { en: "On down key" },
			event: { value: "" }
		},
		{
			name: "onUpKey",
			label: { en: "On up key" },
			event: { value: "" }
		},
		{
			name: "focus",
			label: { en: "On focus" },
			event: null
		},
		{
			name: "blur",
			label: { en: "On blur" },
			event: null
		}
	],
	properties: {
		value: {
			label: { en: "Initial Value" },
			type: "Text",
			section: "settings",
			bindable: true,
			defaultValue: "",
			/* wwEditor:start */
			bindingValidation: {
				validations: [{ type: "string" }],
				tooltip: "A string."
			}
			/* wwEditor:end */
		},
		placeholder: {
			label: { en: "Placeholder" },
			type: "Text",
			section: "settings",
			bindable: true,
			defaultValue: "",
			/* wwEditor:start */
			bindingValidation: {
				validations: [{ type: "string" }],
				tooltip: "A string."
			}
			/* wwEditor:end */
		},
		debounce: {
			label: { en: "Debounce" },
			type: "OnOff",
			section: "settings",
			defaultValue: false
		},
		debounceDelay: {
			label: { en: "Delay" },
			type: "Length",
			options: {
				unitChoices: [{ value: "ms", label: "ms", min: 1, max: 5000 }]
			},
			section: "settings",
			defaultValue: "250ms",
			responsive: true,
			hidden: (content) => !content.debounce
		}
	}
};
