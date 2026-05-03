def scan_inward(values: list[int]) -> None:
    left, right = 0, len(values) - 1
    while left < right:
        use(values[left], values[right])
        if move_left(values[left], values[right]):
            left += 1
        else:
            right -= 1
