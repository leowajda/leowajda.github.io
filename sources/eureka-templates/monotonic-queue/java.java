void pushWindow(ArrayDeque<Integer> deque, int[] values, int index) {
    while (!deque.isEmpty() && values[deque.peekLast()] <= values[index]) deque.removeLast();
    deque.addLast(index);
}

void expireWindow(ArrayDeque<Integer> deque, int left) {
    while (!deque.isEmpty() && deque.peekFirst() < left) deque.removeFirst();
}
