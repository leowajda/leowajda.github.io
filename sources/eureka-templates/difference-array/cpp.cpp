std::vector<int> applyRangeUpdates(int size, const std::vector<std::array<int, 3>>& updates) {
    std::vector<int> diff(size + 1);
    for (auto [left, right, delta] : updates) {
        diff[left] += delta;
        diff[right + 1] -= delta;
    }
    std::vector<int> values(size);
    for (int i = 0, running = 0; i < size; i++) {
        running += diff[i];
        values[i] = running;
    }
    return values;
}
