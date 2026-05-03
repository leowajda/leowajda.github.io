void search(State state, List<Choice> path, List<List<Choice>> answer) {
    if (complete(state)) {
        answer.add(new ArrayList<>(path));
        return;
    }
    for (Choice choice : choices(state)) {
        if (!valid(state, choice)) continue;
        apply(state, choice);
        path.add(choice);
        search(state, path, answer);
        path.remove(path.size() - 1);
        undo(state, choice);
    }
}
