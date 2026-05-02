int increasingSubsequenceLength(const std::vector<int>& values) {
    std::vector<int> tails;
    for (int value : values) {
        auto it = std::lower_bound(tails.begin(), tails.end(), value);
        if (it == tails.end()) tails.push_back(value);
        else *it = value;
    }
    return tails.size();
}
