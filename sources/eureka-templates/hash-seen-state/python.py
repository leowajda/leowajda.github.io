def reaches_repeat(start) -> bool:
    seen = set()
    state = start
    while state not in seen:
        seen.add(state)
        if done(state):
            return False
        state = next_state(state)
    return True
