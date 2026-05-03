def max_concurrent(intervals) -> int:
    active = best = 0
    for event in sorted(events_from(intervals), key=by_time_then_end_before_start):
        active += event.delta
        best = max(best, active)
    return best
