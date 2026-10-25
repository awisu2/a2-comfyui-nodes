class FloatUnpack:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "bundle": ("FLOAT_BUNDLE",),
                "value_num": ("INT", {
                    "default": 1,
                    "min": 1,
                    "max": 100,
                    "step": 1,
                }),
            },
        }

    RETURN_TYPES = ("FLOAT",) * 100
    RETURN_NAMES = tuple(f"output_{i}" for i in range(100))
    FUNCTION = "execute"
    CATEGORY = "A2"

    def execute(self, bundle, value_num):
        values = list(bundle[:value_num])
        values.extend([0.0] * (value_num - len(values)))
        values.extend([0.0] * (100 - value_num))
        return tuple(values)