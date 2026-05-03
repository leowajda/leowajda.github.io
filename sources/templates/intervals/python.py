def merge_intervals(intervals):
    merged = []
    for current in sorted(intervals, key=lambda x: x.start):
        if not merged or merged[-1].end < current.start:
            merged.append(current)
        else:
            merged[-1].end = max(merged[-1].end, current.end)
    return merged
