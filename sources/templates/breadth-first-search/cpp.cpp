void bfs(TreeNode* root) {
    std::queue<TreeNode*> queue;
    if (root != nullptr) queue.push(root);
    while (!queue.empty()) {
        TreeNode* node = queue.front();
        queue.pop();
        visit(node);
        if (node->left != nullptr) queue.push(node->left);
        if (node->right != nullptr) queue.push(node->right);
    }
}
