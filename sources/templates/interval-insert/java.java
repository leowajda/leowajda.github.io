List<Interval> insertInterval(List<Interval> intervals, Interval next) {
    List<Interval> answer = new ArrayList<>();
    int i = 0;
    while (i < intervals.size() && intervals.get(i).end < next.start) answer.add(intervals.get(i++));
    while (i < intervals.size() && intervals.get(i).start <= next.end) next = merge(next, intervals.get(i++));
    answer.add(next);
    while (i < intervals.size()) answer.add(intervals.get(i++));
    return answer;
}
