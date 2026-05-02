def scan_directions(grid, row: int, col: int) -> None:
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        r, c = row + dr, col + dc
        while inside(grid, r, c):
            visit(r, c)
            r += dr
            c += dc
