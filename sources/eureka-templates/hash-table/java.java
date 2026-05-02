Value lookupOrBuild(List<Item> items) {
    Map<Key, Value> seen = new HashMap<>();
    for (Item item : items) {
        Key key = keyOf(item);
        if (seen.containsKey(key)) return merge(seen.get(key), item);
        seen.put(key, valueOf(item));
    }
    return emptyValue();
}
