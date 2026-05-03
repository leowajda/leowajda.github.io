def topological_order(graph: list[list[int]]) -> list[int]:
    indegree = [0] * len(graph)
    for edges in graph:
        for nxt in edges:
            indegree[nxt] += 1
    queue = deque(node for node, degree in enumerate(indegree) if degree == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order
