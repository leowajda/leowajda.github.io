def processWithBest(events: Iterable[Event]): Unit =
  val heap = scala.collection.mutable.PriorityQueue[State]()(betterFirst)
  for event <- events do
    addCandidates(heap, event)
    while heap.nonEmpty && stale(heap.head, event) do heap.dequeue()
    useBest(heap.head, event)
