int bitmaskDp(int n) {
    int[][] dp = new int[1 << n][n];
    fill(dp, INF);
    for (int start = 0; start < n; start++) dp[1 << start][start] = base(start);
    for (int mask = 0; mask < (1 << n); mask++) {
        for (int last = 0; last < n; last++) if (dp[mask][last] != INF) {
            for (int next = 0; next < n; next++) if ((mask & (1 << next)) == 0) {
                relax(dp, mask, last, next);
            }
        }
    }
    return answer(dp);
}
