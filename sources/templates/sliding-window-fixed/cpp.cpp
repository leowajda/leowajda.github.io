int scanFixedWindow(const std::vector<int>& values, int width) {
    int window = 0;
    for (int i = 0; i < width; i++) window += values[i];
    int best = score(window);
    for (int right = width; right < values.size(); right++) {
        window += values[right] - values[right - width];
        best = combine(best, score(window));
    }
    return best;
}
