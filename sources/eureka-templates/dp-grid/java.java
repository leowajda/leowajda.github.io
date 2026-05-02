int gridDp(int rows, int cols) {
    int[][] dp = new int[rows][cols];
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            dp[r][c] = transition(r, c, dp);
        }
    }
    return dp[rows - 1][cols - 1];
}
