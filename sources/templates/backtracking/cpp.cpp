void search(State& state, std::vector<Choice>& path, std::vector<std::vector<Choice>>& answer) {
    if (complete(state)) {
        answer.push_back(path);
        return;
    }
    for (const Choice& choice : choices(state)) {
        if (!valid(state, choice)) continue;
        apply(state, choice);
        path.push_back(choice);
        search(state, path, answer);
        path.pop_back();
        undo(state, choice);
    }
}
