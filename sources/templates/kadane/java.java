int bestSubarray(int[] values) {
    int best = values[0];
    int current = values[0];
    for (int i = 1; i < values.length; i++) {
        current = Math.max(values[i], current + values[i]);
        best = Math.max(best, current);
    }
    return best;
}
