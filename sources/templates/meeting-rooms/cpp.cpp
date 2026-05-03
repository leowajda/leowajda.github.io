int maxConcurrent(const std::vector<Interval>& intervals) {
    auto events = eventsFrom(intervals);
    std::sort(events.begin(), events.end(), byTimeThenEndBeforeStart);
    int active = 0, best = 0;
    for (const Event& event : events) {
        active += event.delta;
        best = std::max(best, active);
    }
    return best;
}
