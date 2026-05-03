bool reachesRepeat(State start) {
    std::unordered_set<State> seen;
    State state = start;
    while (!seen.count(state)) {
        seen.insert(state);
        if (done(state)) return false;
        state = nextState(state);
    }
    return true;
}
