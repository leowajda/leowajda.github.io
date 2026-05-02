def bfs(root) -> None:
    queue = deque([root] if root else [])
    while queue:
        node = queue.popleft()
        visit(node)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
