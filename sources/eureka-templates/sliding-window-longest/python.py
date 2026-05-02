def longest_window(values: list[int]) -> int:
    left = best = 0
    for right, value in enumerate(values):
        add(value)
        while not valid():
            remove(values[left])
            left += 1
        best = max(best, right - left + 1)
    return best
