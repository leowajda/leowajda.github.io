def linear_dp(n: int) -> int:
    dp = [0] * (n + 1)
    dp[0] = base()
    for i in range(1, n + 1):
        dp[i] = transition(i, dp)
    return dp[n]
