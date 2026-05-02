def bestSubarray(values: Array[Int]): Int =
  var current = values(0)
  var best = values(0)
  for value <- values.drop(1) do
    current = value.max(current + value)
    best = best.max(current)
  best
