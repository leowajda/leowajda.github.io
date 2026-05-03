def twoSequenceDp(a: String, b: String): Int =
  val dp = Array.fill(a.length + 1, b.length + 1)(0)
  for i <- 1 to a.length do
    for j <- 1 to b.length do
      dp(i)(j) = transition(a, b, i, j, dp)
  dp(a.length)(b.length)
