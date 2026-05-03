int longestWindow(const std::vector<int>& values) {
    int left = 0, best = 0;
    for (int right = 0; right < values.size(); right++) {
        add(values[right]);
        while (!valid()) remove(values[left++]);
        best = std::max(best, right - left + 1);
    }
    return best;
}
