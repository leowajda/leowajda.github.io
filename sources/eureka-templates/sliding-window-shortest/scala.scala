def shortestWindow(values: Array[Int]): Int =
  var left = 0
  var best = values.length + 1
  for right <- values.indices do
    add(values(right))
    while valid() do
      best = best.min(right - left + 1)
      remove(values(left))
      left += 1
  if best == values.length + 1 then 0 else best
