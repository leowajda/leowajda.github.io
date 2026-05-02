def rolling_hash(text: str, base: int, mod: int) -> list[int]:
    hash_values = [0]
    for ch in text:
        hash_values.append((hash_values[-1] * base + ord(ch)) % mod)
    return hash_values
