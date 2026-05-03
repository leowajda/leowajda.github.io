void dfs(TreeNode node) {
    if (node == null) return;
    visit(node);
    dfs(node.left);
    dfs(node.right);
}
