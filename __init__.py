from .string_passthrough import StringPassthrough
from .string_selector import StringSelector
from .random_number import RandomNumber
from .float_pack import FloatPack
from .float_unpack import FloatUnpack
from .string_selector_yaml import StringSelectorYaml
from .string_multi_selector_yaml import StringMultiSelectorYaml

NODE_CLASS_MAPPINGS = {
    "StringPassthrough": StringPassthrough,
    "StringSelector": StringSelector,
    "RandomNumber": RandomNumber,
    "FloatPack": FloatPack,
    "FloatUnpack": FloatUnpack,
    "StringSelectorYaml": StringSelectorYaml,
    "StringMultiSelectorYaml": StringMultiSelectorYaml
}

WEB_DIRECTORY = "./js"

# this is optionn. for easy development, I'm not using it.
# NODE_DISPLAY_NAME_MAPPINGS = {
#     "StringPassthrough": "String Passthrough"
# }
