void dfs(TreeNode* node) {
    if (node == nullptr) return;
    visit(node);
    dfs(node->left);
    dfs(node->right);
}
