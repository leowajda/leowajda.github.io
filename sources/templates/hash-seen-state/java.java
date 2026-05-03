boolean reachesRepeat(State start) {
    Set<State> seen = new HashSet<>();
    State state = start;
    while (seen.add(state)) {
        if (done(state)) return false;
        state = next(state);
    }
    return true;
}
