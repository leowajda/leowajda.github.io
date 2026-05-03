def distances(graph: Vector[Vector[Int]], start: Int): Array[Int] =
  val dist = Array.fill(graph.length)(-1)
  val queue = scala.collection.mutable.Queue(start)
  dist(start) = 0
  while queue.nonEmpty do
    val node = queue.dequeue()
    for next <- graph(node) do
      if dist(next) == -1 then
        dist(next) = dist(node) + 1
        queue.enqueue(next)
  dist
