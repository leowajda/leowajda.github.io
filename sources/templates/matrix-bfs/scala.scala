def bfs(grid: Array[Array[Int]], row: Int, col: Int): Unit =
  val dirs = Array((1, 0), (-1, 0), (0, 1), (0, -1))
  val queue = scala.collection.mutable.Queue((row, col))
  mark(row, col)
  while queue.nonEmpty do
    val (r, c) = queue.dequeue()
    visit(r, c)
    for (dr, dc) <- dirs do
      val nr = r + dr
      val nc = c + dc
      if inside(grid, nr, nc) && unvisited(nr, nc) then
        mark(nr, nc)
        queue.enqueue((nr, nc))
