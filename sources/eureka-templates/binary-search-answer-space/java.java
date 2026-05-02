int firstFeasible(int low, int high) {
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (feasible(mid)) high = mid;
        else low = mid + 1;
    }
    return low;
}
