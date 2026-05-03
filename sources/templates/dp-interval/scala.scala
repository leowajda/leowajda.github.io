def intervalDp(n: Int): Int =
  val dp = Array.fill(n, n)(0)
  for length <- 1 to n do
    for left <- 0 to n - length do
      val right = left + length - 1
      dp(left)(right) = solveInterval(left, right, dp)
  dp(0)(n - 1)
