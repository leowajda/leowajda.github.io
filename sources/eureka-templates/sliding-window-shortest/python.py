def shortest_window(values: list[int]) -> int:
    left = 0
    best = len(values) + 1
    for right, value in enumerate(values):
        add(value)
        while valid():
            best = min(best, right - left + 1)
            remove(values[left])
            left += 1
    return 0 if best == len(values) + 1 else best
