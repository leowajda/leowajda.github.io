def apply_range_updates(size: int, updates: list[tuple[int, int, int]]) -> list[int]:
    diff = [0] * (size + 1)
    for left, right, delta in updates:
        diff[left] += delta
        diff[right + 1] -= delta
    values, running = [0] * size, 0
    for i in range(size):
        running += diff[i]
        values[i] = running
    return values
