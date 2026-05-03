def dfs(grid, row: int, col: int) -> None:
    if not inside(grid, row, col) or seen(row, col):
        return
    mark(row, col)
    visit(row, col)
    dfs(grid, row + 1, col)
    dfs(grid, row - 1, col)
    dfs(grid, row, col + 1)
    dfs(grid, row, col - 1)
