int greedyWithHeap(List<Item> items) {
    PriorityQueue<Item> heap = new PriorityQueue<>(this::priority);
    int answer = initial();
    for (Item item : items) {
        heap.add(item);
        while (!heap.isEmpty() && invalid(heap.peek())) heap.remove();
        answer = use(answer, heap.peek());
    }
    return answer;
}
