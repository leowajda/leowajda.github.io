int maxConcurrent(List<Interval> intervals) {
    List<Event> events = eventsFrom(intervals);
    events.sort(this::byTimeThenEndBeforeStart);
    int active = 0;
    int best = 0;
    for (Event event : events) {
        active += event.delta;
        best = Math.max(best, active);
    }
    return best;
}
