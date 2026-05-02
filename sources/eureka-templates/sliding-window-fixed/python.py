def scan_fixed_window(values: list[int], width: int) -> int:
    window = sum(values[:width])
    best = score(window)
    for right in range(width, len(values)):
        window += values[right] - values[right - width]
        best = combine(best, score(window))
    return best
