def two_sequence_dp(a: str, b: str) -> int:
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            dp[i][j] = transition(a, b, i, j, dp)
    return dp[len(a)][len(b)]
