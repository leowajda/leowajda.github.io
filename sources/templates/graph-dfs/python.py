def dfs(node: int, graph: list[list[int]], seen: list[bool]) -> None:
    seen[node] = True
    visit(node)
    for nxt in graph[node]:
        if not seen[nxt]:
            dfs(nxt, graph, seen)
