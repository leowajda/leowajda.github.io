def knapsack_dp(weight: list[int], value: list[int], capacity: int) -> int:
    dp = [0] * (capacity + 1)
    for w, v in zip(weight, value):
        for cap in range(capacity, w - 1, -1):
            dp[cap] = max(dp[cap], dp[cap - w] + v)
    return dp[capacity]
