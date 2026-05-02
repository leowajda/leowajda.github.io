def dijkstra(graph, source: int) -> list[int]:
    dist = [INF] * len(graph)
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        cost, node = heappop(heap)
        if cost != dist[node]:
            continue
        for nxt, weight in graph[node]:
            if cost + weight < dist[nxt]:
                dist[nxt] = cost + weight
                heappush(heap, (dist[nxt], nxt))
    return dist
