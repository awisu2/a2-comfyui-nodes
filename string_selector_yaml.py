import yaml

class StringSelectorYaml:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "select": ("STRING", {
                    "default": "",
                    "tooltip": "Which case to run...",
                }),
                "values": ("STRING", {
                    "default": "",
                    "multiline": True,
                    "tooltip": "please enter YAML content",
                }),
            },
        }

    @classmethod
    def VALIDATE_INPUTS(cls, **kwargs):
        return True

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("string",)
    FUNCTION = "execute"
    CATEGORY = "A2"

    # Arguments are needed to have the same name as the widget name
    def execute(self, select, values, **kwargs):
        _, key = select.split(":", 1)
        key = key.strip()

        try:
            parsed_values = yaml.safe_load(values)
        except yaml.YAMLError:
            return ("",)

        if key in parsed_values:
            return (parsed_values[key],)
        return ("",)

