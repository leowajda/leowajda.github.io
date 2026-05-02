def dfs(node: Int, graph: Vector[Vector[Int]], seen: Array[Boolean]): Unit =
  seen(node) = true
  visit(node)
  for next <- graph(node) do
    if !seen(next) then dfs(next, graph, seen)
