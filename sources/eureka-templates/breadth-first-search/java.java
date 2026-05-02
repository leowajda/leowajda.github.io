void bfs(TreeNode root) {
    ArrayDeque<TreeNode> queue = new ArrayDeque<>();
    if (root != null) queue.add(root);
    while (!queue.isEmpty()) {
        TreeNode node = queue.remove();
        visit(node);
        if (node.left != null) queue.add(node.left);
        if (node.right != null) queue.add(node.right);
    }
}
