int search(State state) {
    if (complete(state)) return value(state);
    int answer = identity();
    for (Choice choice : choices(state)) {
        if (!valid(state, choice)) continue;
        apply(state, choice);
        answer = combine(answer, search(state));
        undo(state, choice);
    }
    return answer;
}
