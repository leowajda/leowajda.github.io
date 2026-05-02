def dfs(grid: Array[Array[Int]], row: Int, col: Int): Unit =
  if inside(grid, row, col) && !seen(row, col) then
    mark(row, col)
    visit(row, col)
    dfs(grid, row + 1, col)
    dfs(grid, row - 1, col)
    dfs(grid, row, col + 1)
    dfs(grid, row, col - 1)
