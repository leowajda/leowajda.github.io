int greedyWithHeap(const std::vector<Item>& items) {
    std::priority_queue<Item, std::vector<Item>, Priority> heap;
    int answer = initial();
    for (const Item& item : items) {
        heap.push(item);
        while (!heap.empty() && invalid(heap.top())) heap.pop();
        answer = use(answer, heap.top());
    }
    return answer;
}
