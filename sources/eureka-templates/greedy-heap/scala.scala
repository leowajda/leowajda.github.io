def greedyWithHeap(items: Iterable[Item]): Int =
  val heap = scala.collection.mutable.PriorityQueue[Item]()(priority)
  var answer = initial()
  for item <- items do
    heap.enqueue(item)
    while heap.nonEmpty && invalid(heap.head) do heap.dequeue()
    answer = use(answer, heap.head)
  answer
