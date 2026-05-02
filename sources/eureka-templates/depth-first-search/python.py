def dfs(node) -> None:
    if not node:
        return
    visit(node)
    dfs(node.left)
    dfs(node.right)
