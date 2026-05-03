int shortestWindow(int[] values) {
    int best = values.length + 1;
    for (int left = 0, right = 0; right < values.length; right++) {
        add(values[right]);
        while (valid()) {
            best = Math.min(best, right - left + 1);
            remove(values[left++]);
        }
    }
    return best == values.length + 1 ? 0 : best;
}
