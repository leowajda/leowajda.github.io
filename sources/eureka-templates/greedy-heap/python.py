def greedy_with_heap(items) -> int:
    heap = []
    answer = initial()
    for item in items:
        heappush(heap, ranked(item))
        while heap and invalid(heap[0]):
            heappop(heap)
        answer = use(answer, heap[0])
    return answer
