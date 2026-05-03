def compact(values: list[int]) -> int:
    write = 0
    for read, value in enumerate(values):
        if keep(value):
            values[write] = transform(value)
            write += 1
    return write
