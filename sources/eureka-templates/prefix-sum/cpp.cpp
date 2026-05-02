std::vector<int> prefixSums(const std::vector<int>& values) {
    std::vector<int> prefix(values.size() + 1);
    for (int i = 0; i < values.size(); i++) {
        prefix[i + 1] = prefix[i] + values[i];
    }
    return prefix;
}

int rangeSum(const std::vector<int>& prefix, int left, int right) {
    return prefix[right] - prefix[left];
}
