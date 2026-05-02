def add(value: Int): Unit =
  if low.isEmpty || value <= low.head then low.enqueue(value)
  else high.enqueue(value)
  if low.size > high.size + 1 then high.enqueue(low.dequeue())
  if high.size > low.size then low.enqueue(high.dequeue())
