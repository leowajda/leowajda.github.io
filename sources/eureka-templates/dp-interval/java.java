int intervalDp(int n) {
    int[][] dp = new int[n][n];
    for (int length = 1; length <= n; length++) {
        for (int left = 0; left + length <= n; left++) {
            int right = left + length - 1;
            dp[left][right] = solveInterval(left, right, dp);
        }
    }
    return dp[0][n - 1];
}
