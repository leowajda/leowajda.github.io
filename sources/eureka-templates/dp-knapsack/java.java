int knapsackDp(int[] weight, int[] value, int capacity) {
    int[] dp = new int[capacity + 1];
    for (int item = 0; item < weight.length; item++) {
        for (int cap = capacity; cap >= weight[item]; cap--) {
            dp[cap] = Math.max(dp[cap], dp[cap - weight[item]] + value[item]);
        }
    }
    return dp[capacity];
}
