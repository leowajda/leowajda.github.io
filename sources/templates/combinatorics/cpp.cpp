std::vector<std::vector<long long>> combinations(int n) {
    std::vector<std::vector<long long>> choose(n + 1, std::vector<long long>(n + 1));
    for (int i = 0; i <= n; i++) {
        choose[i][0] = choose[i][i] = 1;
        for (int j = 1; j < i; j++) choose[i][j] = choose[i - 1][j - 1] + choose[i - 1][j];
    }
    return choose;
}
