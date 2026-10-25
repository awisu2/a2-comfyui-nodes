from .common.contains_any_dict import ContainsAnyDict

INPUT_PREFIX = "input_"
SELECT_WIDGET_NAME = "select"

class StringSelector:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                SELECT_WIDGET_NAME: ("STRING", {
                    "default": "",
                    "tooltip": "Which case to run...",
                }),
            },
            "optional": ContainsAnyDict(INPUT_PREFIX, "STRING", forceInput=True, lazy=True),
        }

    @classmethod
    def VALIDATE_INPUTS(cls, **kwargs):
        return True

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "execute"
    CATEGORY = "A2"

    # Arguments are needed to have the same name as the widget name
    def check_lazy_status(self, select, **kwargs):
        number = self.getSelectPrefix(select)
        selected = f"{INPUT_PREFIX}{number}"

        if selected not in kwargs:
            return []

        if kwargs[selected] is None:
            return [selected]

        return []

    # Arguments are needed to have the same name as the widget name
    def execute(self, select, **kwargs):
        number = self.getSelectPrefix(select)
        return (kwargs.get(f"{INPUT_PREFIX}{number}", ""),)

    def getSelectPrefix(self, select):
        return str(select).split(":", 1)[0].strip()
