int longestWindow(int[] values) {
    int best = 0;
    for (int left = 0, right = 0; right < values.length; right++) {
        add(values[right]);
        while (!valid()) remove(values[left++]);
        best = Math.max(best, right - left + 1);
    }
    return best;
}
