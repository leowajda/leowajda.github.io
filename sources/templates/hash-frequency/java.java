Map<Key, Integer> frequencies(List<Item> items) {
    Map<Key, Integer> counts = new HashMap<>();
    for (Item item : items) {
        Key key = keyOf(item);
        counts.put(key, counts.getOrDefault(key, 0) + 1);
    }
    return counts;
}
