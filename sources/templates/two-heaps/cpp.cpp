void add(int value) {
    if (low.empty() || value <= low.top()) low.push(value);
    else high.push(value);
    if (low.size() > high.size() + 1) {
        high.push(low.top());
        low.pop();
    }
    if (high.size() > low.size()) {
        low.push(high.top());
        high.pop();
    }
}
