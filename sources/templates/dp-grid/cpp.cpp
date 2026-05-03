int gridDp(int rows, int cols) {
    std::vector<std::vector<int>> dp(rows, std::vector<int>(cols));
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            dp[r][c] = transition(r, c, dp);
        }
    }
    return dp[rows - 1][cols - 1];
}
