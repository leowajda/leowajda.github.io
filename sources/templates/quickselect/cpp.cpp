int select(std::vector<int>& values, int k) {
    int left = 0, right = static_cast<int>(values.size()) - 1;
    while (left <= right) {
        int pivot = partition(values, left, right);
        if (pivot == k) return values[pivot];
        if (pivot < k) left = pivot + 1;
        else right = pivot - 1;
    }
    return -1;
}
