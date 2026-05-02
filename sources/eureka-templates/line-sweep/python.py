def sweep(events) -> int:
    active = 0
    answer = initial()
    for event in sorted(events, key=event_order):
        active += event.delta
        answer = update(answer, event, active)
    return answer
