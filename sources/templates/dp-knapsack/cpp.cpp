int knapsackDp(const std::vector<int>& weight, const std::vector<int>& value, int capacity) {
    std::vector<int> dp(capacity + 1);
    for (int item = 0; item < weight.size(); item++) {
        for (int cap = capacity; cap >= weight[item]; cap--) {
            dp[cap] = std::max(dp[cap], dp[cap - weight[item]] + value[item]);
        }
    }
    return dp[capacity];
}
