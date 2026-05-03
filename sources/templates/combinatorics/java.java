long[][] combinations(int n) {
    long[][] choose = new long[n + 1][n + 1];
    for (int i = 0; i <= n; i++) {
        choose[i][0] = choose[i][i] = 1;
        for (int j = 1; j < i; j++) choose[i][j] = choose[i - 1][j - 1] + choose[i - 1][j];
    }
    return choose;
}
