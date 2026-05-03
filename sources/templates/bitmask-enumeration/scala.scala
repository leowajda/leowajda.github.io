def enumerate(n: Int): Unit =
  for mask <- 0 until (1 << n) do
    for bit <- 0 until n do
      if (mask & (1 << bit)) != 0 then use(bit)
    finish(mask)
