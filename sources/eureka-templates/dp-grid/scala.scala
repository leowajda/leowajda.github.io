def gridDp(rows: Int, cols: Int): Int =
  val dp = Array.fill(rows, cols)(0)
  for r <- 0 until rows do
    for c <- 0 until cols do
      dp(r)(c) = transition(r, c, dp)
  dp(rows - 1)(cols - 1)
