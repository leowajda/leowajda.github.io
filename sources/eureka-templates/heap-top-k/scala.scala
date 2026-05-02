def topK(items: Iterable[Item], k: Int): Vector[Item] =
  val heap = scala.collection.mutable.PriorityQueue[Item]()(Ordering.by(-score(_)))
  for item <- items do
    heap.enqueue(item)
    if heap.size > k then heap.dequeue()
  heap.toVector
