def topologicalOrder(graph: Vector[Vector[Int]]): Vector[Int] =
  val indegree = Array.fill(graph.length)(0)
  for edges <- graph; next <- edges do indegree(next) += 1
  val queue = scala.collection.mutable.Queue[Int]()
  for node <- graph.indices do if indegree(node) == 0 then queue.enqueue(node)
  val order = scala.collection.mutable.Buffer[Int]()
  while queue.nonEmpty do
    val node = queue.dequeue()
    order += node
    for next <- graph(node) do
      indegree(next) -= 1
      if indegree(next) == 0 then queue.enqueue(next)
  order.toVector
