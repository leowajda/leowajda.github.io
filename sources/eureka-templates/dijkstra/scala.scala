def dijkstra(graph: Vector[Vector[Edge]], source: Int): Array[Int] =
  val dist = Array.fill(graph.length)(INF)
  val heap = scala.collection.mutable.PriorityQueue[(Int, Int)]()(Ordering.by(-_._1))
  dist(source) = 0
  heap.enqueue((0, source))
  while heap.nonEmpty do
    val (cost, node) = heap.dequeue()
    if cost == dist(node) then
      for edge <- graph(node) do
        if cost + edge.weight < dist(edge.to) then
          dist(edge.to) = cost + edge.weight
          heap.enqueue((dist(edge.to), edge.to))
  dist
