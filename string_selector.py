
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
                SELECT_WIDGET_NAME: (["0"],),
            },
            "optional": ContainsAnyDict({}),
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
