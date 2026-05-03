List<Item> topK(List<Item> items, int k) {
    PriorityQueue<Item> heap = new PriorityQueue<>(Comparator.comparingInt(this::score));
    for (Item item : items) {
        heap.add(item);
        if (heap.size() > k) heap.remove();
    }
    return new ArrayList<>(heap);
}
