def linearDp(n: Int): Int =
  val dp = Array.fill(n + 1)(0)
  dp(0) = base()
  for i <- 1 to n do dp(i) = transition(i, dp)
  dp(n)
