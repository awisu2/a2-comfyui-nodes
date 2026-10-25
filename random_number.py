
import random
import time


class RandomNumber:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "min": ("INT", {
                    "default": 0,
                    "min": -9007199254740991,
                    "max": 9007199254740991,
                }),
                "max": ("INT", {
                    "default": 9007199254740991,
                    "min": -9007199254740991,
                    "max": 9007199254740991,
                }),
            }
        }

    RETURN_TYPES = ("INT", "STRING")
    RETURN_NAMES = ("number", "text")
    FUNCTION = "execute"
    CATEGORY = "A2"
    DESCRIPTION = "Generates a random number between the specified minimum and maximum values. it also can output by text"

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("nan")

    def execute(self, min, max):
        number = random.randint(min, max)
        return {
            "ui": {
                "text": [str(number)]
            },
            "result": (number, str(number))
        }
