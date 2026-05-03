void enumerate(int n) {
    for (int mask = 0; mask < (1 << n); mask++) {
        for (int bit = 0; bit < n; bit++) {
            if (mask & (1 << bit)) use(bit);
        }
        finish(mask);
    }
}
