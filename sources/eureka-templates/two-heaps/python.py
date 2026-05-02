def add(value: int) -> None:
    if not low or value <= -low[0]:
        heappush(low, -value)
    else:
        heappush(high, value)
    if len(low) > len(high) + 1:
        heappush(high, -heappop(low))
    if len(high) > len(low):
        heappush(low, -heappop(high))
