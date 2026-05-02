int searchRotated(const std::vector<int>& values, int target) {
    int left = 0, right = static_cast<int>(values.size()) - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (values[mid] == target) return mid;
        if (values[left] <= values[mid]) {
            if (values[left] <= target && target < values[mid]) right = mid - 1;
            else left = mid + 1;
        } else if (values[mid] < target && target <= values[right]) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}
