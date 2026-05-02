def prefix_sums(values: list[int]) -> list[int]:
    prefix = [0]
    for value in values:
        prefix.append(prefix[-1] + value)
    return prefix

def range_sum(prefix: list[int], left: int, right: int) -> int:
    return prefix[right] - prefix[left]
