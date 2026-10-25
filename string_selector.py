
class ContainsAnyDict(dict):
    def __contains__(self, key):
        return key.startswith("text_") or super().__contains__(key)

    def __getitem__(self, key):
        if key.startswith("text_"):
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
                "index": ("INT", {
                    "default": 0,
                    "min": 0,
                    "max": 9999,
                    "step": 1,
                }),
            },
            "optional": ContainsAnyDict({
                "text_0": ("STRING", {
                    "forceInput": True,
                    "lazy": True,
                }),
            }),
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "execute"
    CATEGORY = "A2"

    def check_lazy_status(self, index, **kwargs):
        selected = f"text_{index}"

        if selected not in kwargs:
            return []

        if kwargs[selected] is None:
            return [selected]

        return []

    def execute(self, index, **kwargs):
        return (kwargs.get(f"text_{index}", ""),)
