List<Interval> mergeIntervals(List<Interval> intervals) {
    intervals.sort(Comparator.comparingInt(a -> a.start));
    List<Interval> merged = new ArrayList<>();
    for (Interval current : intervals) {
        if (merged.isEmpty() || merged.get(merged.size() - 1).end < current.start) merged.add(current);
        else merged.get(merged.size() - 1).end = Math.max(merged.get(merged.size() - 1).end, current.end);
    }
    return merged;
}
