std::vector<int> prefixTable(const std::string& pattern) {
    std::vector<int> prefix(pattern.size());
    for (int i = 1, j = 0; i < pattern.size(); i++) {
        while (j > 0 && pattern[i] != pattern[j]) j = prefix[j - 1];
        if (pattern[i] == pattern[j]) j++;
        prefix[i] = j;
    }
    return prefix;
}
