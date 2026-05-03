boolean[] sieve(int n) {
    boolean[] prime = new boolean[n + 1];
    Arrays.fill(prime, true);
    if (n >= 0) prime[0] = false;
    if (n >= 1) prime[1] = false;
    for (int p = 2; p * p <= n; p++) if (prime[p]) {
        for (int x = p * p; x <= n; x += p) prime[x] = false;
    }
    return prime;
}
