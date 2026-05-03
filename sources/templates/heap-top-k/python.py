def top_k(items, k: int) -> list:
    heap = []
    for item in items:
        heappush(heap, (score(item), item))
        if len(heap) > k:
            heappop(heap)
    return [item for _, item in heap]
