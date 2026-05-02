def greedy_after_sort(items) -> int:
    answer = initial()
    for item in sorted(items, key=priority):
        if compatible(item):
            answer = take(answer, item)
    return answer
