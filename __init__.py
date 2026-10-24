class A2StringPassthrough:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {"default": "", "multiline": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "execute"
    CATEGORY = "A2"

    def execute(self, text):
        return (text,)


NODE_CLASS_MAPPINGS = {
    "A2StringPassthrough": A2StringPassthrough
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "A2StringPassthrough": "String Passthrough (A2)"
}
