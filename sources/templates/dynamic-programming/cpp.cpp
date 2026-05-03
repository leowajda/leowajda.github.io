int linearDp(int n) {
    std::vector<int> dp(n + 1);
    dp[0] = base();
    for (int i = 1; i <= n; i++) {
        dp[i] = transition(i, dp);
    }
    return dp[n];
}
