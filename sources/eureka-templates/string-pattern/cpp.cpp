std::vector<long long> rollingHash(const std::string& text, long long base, long long mod) {
    std::vector<long long> hash(text.size() + 1);
    for (int i = 0; i < text.size(); i++) {
        hash[i + 1] = (hash[i] * base + text[i]) % mod;
    }
    return hash;
}
