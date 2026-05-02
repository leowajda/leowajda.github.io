int[] prefixSums(int[] values) {
    int[] prefix = new int[values.length + 1];
    for (int i = 0; i < values.length; i++) {
        prefix[i + 1] = prefix[i] + values[i];
    }
    return prefix;
}

int rangeSum(int[] prefix, int left, int right) {
    return prefix[right] - prefix[left];
}
