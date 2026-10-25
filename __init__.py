from .string_passthrough import StringPassthrough
from .string_selector import StringSelector
from .random_number import RandomNumber
from .float_pack import FloatPack
from .float_unpack import FloatUnpack

NODE_CLASS_MAPPINGS = {
    "StringPassthrough": StringPassthrough,
    "StringSelector": StringSelector,
    "RandomNumber": RandomNumber,
    "FloatPack": FloatPack,
    "FloatUnpack": FloatUnpack
}

WEB_DIRECTORY = "./js"

# this is optionn. for easy development, I'm not using it.
# NODE_DISPLAY_NAME_MAPPINGS = {
#     "StringPassthrough": "String Passthrough"
# }
