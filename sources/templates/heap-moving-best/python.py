def process_with_best(events) -> None:
    heap = []
    for event in events:
        add_candidates(heap, event)
        while heap and stale(heap[0], event):
            heappop(heap)
        use_best(heap[0], event)
