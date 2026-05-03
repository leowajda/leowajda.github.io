def longestWindow(values: Array[Int]): Int =
  var left = 0
  var best = 0
  for right <- values.indices do
    add(values(right))
    while !valid() do
      remove(values(left))
      left += 1
    best = best.max(right - left + 1)
  best
