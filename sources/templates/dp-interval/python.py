def interval_dp(n: int) -> int:
    dp = [[0] * n for _ in range(n)]
    for length in range(1, n + 1):
        for left in range(n - length + 1):
            right = left + length - 1
            dp[left][right] = solve_interval(left, right, dp)
    return dp[0][n - 1]
