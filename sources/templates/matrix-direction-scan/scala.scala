def scanDirections(grid: Array[Array[Int]], row: Int, col: Int): Unit =
  for (dr, dc) <- Array((1, 0), (-1, 0), (0, 1), (0, -1)) do
    var r = row + dr
    var c = col + dc
    while inside(grid, r, c) do
      visit(r, c)
      r += dr
      c += dc
