def greedy(items) -> int:
    answer = initial()
    for item in items:
        if forced(item):
            answer = take(answer, item)
    return answer
