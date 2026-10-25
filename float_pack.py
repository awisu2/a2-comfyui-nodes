from .common.contains_any_dict import ContainsAnyDict

class FloatPack:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "value_num": ("INT", {
                    "default": 1,
                    "min": 1,
                    "max": 100,
                    "step": 1,
                }),
            },
            "optional": ContainsAnyDict("input_", "FLOAT", default=0.0),
        }

    @classmethod
    def VALIDATE_INPUTS(cls, **kwargs):
        return True

    RETURN_TYPES = ("FLOAT_BUNDLE",)
    RETURN_NAMES = ("bundle",)
    FUNCTION = "execute"
    CATEGORY = "A2"

    def execute(self, value_num, **kwargs):
        values = [
            float(kwargs.get(f"input_{i}", 0.0))
            for i in range(value_num)
        ]
        return (values,)
