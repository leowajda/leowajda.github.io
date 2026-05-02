void add(int value) {
    if (low.isEmpty() || value <= low.peek()) low.add(value);
    else high.add(value);
    if (low.size() > high.size() + 1) high.add(low.remove());
    if (high.size() > low.size()) low.add(high.remove());
}
