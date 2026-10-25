class ContainsAnyDict(dict):
    def __init__(self, prefix, data_type, **options):
        super().__init__()
        self.prefix = prefix
        self.data_type = data_type
        self.options = options

    def __contains__(self, key):
        return key.startswith(self.prefix) or super().__contains__(key)

    def __getitem__(self, key):
        if key.startswith(self.prefix):
            return (self.data_type, self.options)
        return super().__getitem__(key)