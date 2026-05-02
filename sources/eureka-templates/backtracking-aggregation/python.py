def search(state) -> int:
    if complete(state):
        return value(state)
    answer = identity()
    for choice in choices(state):
        if not valid(state, choice):
            continue
        apply(state, choice)
        answer = combine(answer, search(state))
        undo(state, choice)
    return answer
