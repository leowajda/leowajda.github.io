std::unordered_map<Key, int> frequencies(const std::vector<Item>& items) {
    std::unordered_map<Key, int> counts;
    for (const Item& item : items) {
        counts[keyOf(item)]++;
    }
    return counts;
}
