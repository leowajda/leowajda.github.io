int bestSubarray(const std::vector<int>& values) {
    int current = values[0], best = values[0];
    for (int i = 1; i < values.size(); i++) {
        current = std::max(values[i], current + values[i]);
        best = std::max(best, current);
    }
    return best;
}
