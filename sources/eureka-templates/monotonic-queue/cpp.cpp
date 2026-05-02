void pushWindow(std::deque<int>& deque, const std::vector<int>& values, int index) {
    while (!deque.empty() && values[deque.back()] <= values[index]) deque.pop_back();
    deque.push_back(index);
}

void expireWindow(std::deque<int>& deque, int left) {
    while (!deque.empty() && deque.front() < left) deque.pop_front();
}
