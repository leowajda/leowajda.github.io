int intervalDp(int n) {
    std::vector<std::vector<int>> dp(n, std::vector<int>(n));
    for (int length = 1; length <= n; length++) {
        for (int left = 0; left + length <= n; left++) {
            int right = left + length - 1;
            dp[left][right] = solveInterval(left, right, dp);
        }
    }
    return dp[0][n - 1];
}
