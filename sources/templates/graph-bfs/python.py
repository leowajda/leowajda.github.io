def distances(graph: list[list[int]], start: int) -> list[int]:
    dist = [-1] * len(graph)
    dist[start] = 0
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in graph[node]:
            if dist[nxt] == -1:
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return dist
