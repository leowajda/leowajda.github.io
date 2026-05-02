int twoSequenceDp(String a, String b) {
    int[][] dp = new int[a.length() + 1][b.length() + 1];
    for (int i = 1; i <= a.length(); i++) {
        for (int j = 1; j <= b.length(); j++) {
            dp[i][j] = transition(a, b, i, j, dp);
        }
    }
    return dp[a.length()][b.length()];
}
