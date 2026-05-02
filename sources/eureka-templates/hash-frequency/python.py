def frequencies(items) -> dict:
    counts = {}
    for item in items:
        key = key_of(item)
        counts[key] = counts.get(key, 0) + 1
    return counts
