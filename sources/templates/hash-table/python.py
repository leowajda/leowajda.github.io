def lookup_or_build(items):
    seen = {}
    for item in items:
        key = key_of(item)
        if key in seen:
            return merge(seen[key], item)
        seen[key] = value_of(item)
    return empty_value()
