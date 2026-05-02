int shortestWindow(const std::vector<int>& values) {
    int left = 0, best = static_cast<int>(values.size()) + 1;
    for (int right = 0; right < values.size(); right++) {
        add(values[right]);
        while (valid()) {
            best = std::min(best, right - left + 1);
            remove(values[left++]);
        }
    }
    return best == values.size() + 1 ? 0 : best;
}
