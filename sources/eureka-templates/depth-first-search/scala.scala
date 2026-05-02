def dfs(node: TreeNode): Unit =
  if node != null then
    visit(node)
    dfs(node.left)
    dfs(node.right)
