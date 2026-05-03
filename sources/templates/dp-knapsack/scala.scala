def knapsackDp(weight: Array[Int], value: Array[Int], capacity: Int): Int =
  val dp = Array.fill(capacity + 1)(0)
  for item <- weight.indices do
    for cap <- capacity to weight(item) by -1 do
      dp(cap) = dp(cap).max(dp(cap - weight(item)) + value(item))
  dp(capacity)
