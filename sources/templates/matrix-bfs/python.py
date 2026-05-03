def bfs(grid, row: int, col: int) -> None:
    queue = deque([(row, col)])
    mark(row, col)
    while queue:
        r, c = queue.popleft()
        visit(r, c)
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if inside(grid, nr, nc) and unvisited(nr, nc):
                mark(nr, nc)
                queue.append((nr, nc))
