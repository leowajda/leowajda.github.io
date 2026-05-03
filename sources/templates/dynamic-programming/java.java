int linearDp(int n) {
    int[] dp = new int[n + 1];
    dp[0] = base();
    for (int i = 1; i <= n; i++) {
        dp[i] = transition(i, dp);
    }
    return dp[n];
}
