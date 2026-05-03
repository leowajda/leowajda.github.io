def sort_and_scan(items) -> int:
    answer = initial()
    for item in sorted(items, key=order):
        answer = consume(answer, item)
    return answer
