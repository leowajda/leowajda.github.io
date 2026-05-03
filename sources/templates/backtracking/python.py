def search(state, path, answer) -> None:
    if complete(state):
        answer.append(path.copy())
        return
    for choice in choices(state):
        if not valid(state, choice):
            continue
        apply(state, choice)
        path.append(choice)
        search(state, path, answer)
        path.pop()
        undo(state, choice)
