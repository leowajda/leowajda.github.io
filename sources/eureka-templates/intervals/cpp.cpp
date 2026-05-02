std::vector<Interval> mergeIntervals(std::vector<Interval> intervals) {
    std::sort(intervals.begin(), intervals.end(), [](const Interval& a, const Interval& b) {
        return a.start < b.start;
    });
    std::vector<Interval> merged;
    for (Interval current : intervals) {
        if (merged.empty() || merged.back().end < current.start) merged.push_back(current);
        else merged.back().end = std::max(merged.back().end, current.end);
    }
    return merged;
}
