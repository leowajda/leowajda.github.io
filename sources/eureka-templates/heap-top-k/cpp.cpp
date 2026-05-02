std::vector<Item> topK(const std::vector<Item>& items, int k) {
    auto worse = [](const Item& a, const Item& b) { return score(a) > score(b); };
    std::priority_queue<Item, std::vector<Item>, decltype(worse)> heap(worse);
    for (const Item& item : items) {
        heap.push(item);
        if (heap.size() > k) heap.pop();
    }
    return drain(heap);
}
