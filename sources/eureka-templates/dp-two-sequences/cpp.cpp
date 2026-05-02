int twoSequenceDp(const std::string& a, const std::string& b) {
    std::vector<std::vector<int>> dp(a.size() + 1, std::vector<int>(b.size() + 1));
    for (int i = 1; i <= a.size(); i++) {
        for (int j = 1; j <= b.size(); j++) {
            dp[i][j] = transition(a, b, i, j, dp);
        }
    }
    return dp[a.size()][b.size()];
}
