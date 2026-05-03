def enumerate(n: int) -> None:
    for mask in range(1 << n):
        for bit in range(n):
            if mask & (1 << bit):
                use(bit)
        finish(mask)
