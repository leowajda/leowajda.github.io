std::vector<Interval> insertInterval(const std::vector<Interval>& intervals, Interval next) {
    std::vector<Interval> answer;
    int i = 0;
    while (i < intervals.size() && intervals[i].end < next.start) answer.push_back(intervals[i++]);
    while (i < intervals.size() && intervals[i].start <= next.end) next = merge(next, intervals[i++]);
    answer.push_back(next);
    while (i < intervals.size()) answer.push_back(intervals[i++]);
    return answer;
}
