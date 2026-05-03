int[] applyRangeUpdates(int size, int[][] updates) {
    int[] diff = new int[size + 1];
    for (int[] update : updates) {
        diff[update[0]] += update[2];
        diff[update[1] + 1] -= update[2];
    }
    int[] values = new int[size];
    for (int i = 0, running = 0; i < size; i++) {
        running += diff[i];
        values[i] = running;
    }
    return values;
}
