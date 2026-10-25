
INPUT_PREFIX = "input_"
SELECT_WIDGET_NAME = "select"

class ContainsAnyDict(dict):
    def __contains__(self, key):
        return key.startswith(INPUT_PREFIX) or super().__contains__(key)

    def __getitem__(self, key):
        if key.startswith(INPUT_PREFIX):
            return ("STRING", {
                "forceInput": True,
                "lazy": True,
            })
        return super().__getitem__(key)


class StringSelector:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                SELECT_WIDGET_NAME: ("INT", {
                    "default": 0,
                    "min": 0,
                    "max": 9999,
                    "step": 1,
                }),
            },
            "optional": ContainsAnyDict({}),
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "execute"
    CATEGORY = "A2"

    def check_lazy_status(self, select, **kwargs):
        selected = f"{INPUT_PREFIX}{select}"

        if selected not in kwargs:
            return []

        if kwargs[selected] is None:
            return [selected]

        return []

    def execute(self, select, **kwargs):
        return (kwargs.get(f"{INPUT_PREFIX}{select}", ""),)
