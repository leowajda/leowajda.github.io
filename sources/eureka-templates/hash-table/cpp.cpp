Value lookupOrBuild(const std::vector<Item>& items) {
    std::unordered_map<Key, Value> seen;
    for (const Item& item : items) {
        Key key = keyOf(item);
        if (seen.count(key)) return merge(seen[key], item);
        seen[key] = valueOf(item);
    }
    return emptyValue();
}
