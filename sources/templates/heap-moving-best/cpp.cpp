void processWithBest(const std::vector<Event>& events) {
    std::priority_queue<State, std::vector<State>, BetterFirst> heap;
    for (const Event& event : events) {
        addCandidates(heap, event);
        while (!heap.empty() && stale(heap.top(), event)) heap.pop();
        useBest(heap.top(), event);
    }
}
