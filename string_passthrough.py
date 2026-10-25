class StringPassthrough:
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
    DESCRIPTION = "Passes the input string through unchanged."

    def execute(self, text):
        return (text,)

