long[] rollingHash(String text, long base, long mod) {
    long[] hash = new long[text.length() + 1];
    for (int i = 0; i < text.length(); i++) {
        hash[i + 1] = (hash[i] * base + text.charAt(i)) % mod;
    }
    return hash;
}
