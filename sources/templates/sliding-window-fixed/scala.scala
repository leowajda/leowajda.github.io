def scanFixedWindow(values: Array[Int], width: Int): Int =
  var window = values.take(width).sum
  var best = score(window)
  for right <- width until values.length do
    window += values(right) - values(right - width)
    best = combine(best, score(window))
  best
