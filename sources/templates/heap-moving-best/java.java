void processWithBest(List<Event> events) {
    PriorityQueue<State> heap = new PriorityQueue<>(this::betterFirst);
    for (Event event : events) {
        addCandidates(heap, event);
        while (!heap.isEmpty() && stale(heap.peek(), event)) heap.remove();
        useBest(heap.peek(), event);
    }
}
