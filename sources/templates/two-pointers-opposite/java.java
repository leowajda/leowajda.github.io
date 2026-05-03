void scanInward(int[] values) {
    int left = 0;
    int right = values.length - 1;
    while (left < right) {
        use(values[left], values[right]);
        if (moveLeft(values[left], values[right])) left++;
        else right--;
    }
}
