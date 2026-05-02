def select(values: list[int], k: int) -> int:
    left, right = 0, len(values) - 1
    while left <= right:
        pivot = partition(values, left, right)
        if pivot == k:
            return values[pivot]
        if pivot < k:
            left = pivot + 1
        else:
            right = pivot - 1
    return -1
