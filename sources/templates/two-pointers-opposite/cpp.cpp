void scanInward(const std::vector<int>& values) {
    int left = 0, right = static_cast<int>(values.size()) - 1;
    while (left < right) {
        use(values[left], values[right]);
        if (moveLeft(values[left], values[right])) left++;
        else right--;
    }
}
