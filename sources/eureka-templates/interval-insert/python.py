def insert_interval(intervals, next_interval):
    answer, i = [], 0
    while i < len(intervals) and intervals[i].end < next_interval.start:
        answer.append(intervals[i])
        i += 1
    while i < len(intervals) and intervals[i].start <= next_interval.end:
        next_interval = merge(next_interval, intervals[i])
        i += 1
    return answer + [next_interval] + intervals[i:]
