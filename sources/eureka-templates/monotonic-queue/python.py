def push_window(deque, values: list[int], index: int) -> None:
    while deque and values[deque[-1]] <= values[index]:
        deque.pop()
    deque.append(index)

def expire_window(deque, left: int) -> None:
    while deque and deque[0] < left:
        deque.popleft()
