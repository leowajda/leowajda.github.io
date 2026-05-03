def bitmask_dp(n: int) -> int:
    dp = [[INF] * n for _ in range(1 << n)]
    for start in range(n):
        dp[1 << start][start] = base(start)
    for mask in range(1 << n):
        for last in range(n):
            if dp[mask][last] == INF:
                continue
            for nxt in range(n):
                if not mask & (1 << nxt):
                    relax(dp, mask, last, nxt)
    return answer(dp)
