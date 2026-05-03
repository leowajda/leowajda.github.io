int lowerBound(const std::vector<int>& values, int target) {
    int left = 0, right = values.size();
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (values[mid] < target) left = mid + 1;
        else right = mid;
    }
    return left;
}
