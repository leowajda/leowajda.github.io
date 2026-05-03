def pushWindow(deque: scala.collection.mutable.ArrayDeque[Int], values: Array[Int], index: Int): Unit =
  while deque.nonEmpty && values(deque.last) <= values(index) do deque.removeLast()
  deque.append(index)

def expireWindow(deque: scala.collection.mutable.ArrayDeque[Int], left: Int): Unit =
  while deque.nonEmpty && deque.head < left do deque.removeHead()
