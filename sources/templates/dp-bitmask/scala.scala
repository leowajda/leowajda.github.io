def bitmaskDp(n: Int): Int =
  val dp = Array.fill(1 << n, n)(INF)
  for start <- 0 until n do dp(1 << start)(start) = base(start)
  for mask <- 0 until (1 << n) do
    for last <- 0 until n do
      if dp(mask)(last) != INF then
        for next <- 0 until n do
          if (mask & (1 << next)) == 0 then relax(dp, mask, last, next)
  answer(dp)
