def grid_dp(rows: int, cols: int) -> int:
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            dp[r][c] = transition(r, c, dp)
    return dp[rows - 1][cols - 1]
