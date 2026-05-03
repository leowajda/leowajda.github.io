int increasingSubsequenceLength(int[] values) {
    int[] tails = new int[values.length];
    int size = 0;
    for (int value : values) {
        int i = lowerBound(tails, size, value);
        tails[i] = value;
        if (i == size) size++;
    }
    return size;
}
