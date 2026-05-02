std::vector<bool> sieve(int n) {
    std::vector<bool> prime(n + 1, true);
    if (n >= 0) prime[0] = false;
    if (n >= 1) prime[1] = false;
    for (int p = 2; p * p <= n; p++) if (prime[p]) {
        for (int x = p * p; x <= n; x += p) prime[x] = false;
    }
    return prime;
}
