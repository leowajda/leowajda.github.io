void serialize(TreeNode* node, std::vector<std::string>& out) {
    if (node == nullptr) {
        out.push_back("#");
        return;
    }
    out.push_back(std::to_string(node->value));
    serialize(node->left, out);
    serialize(node->right, out);
}
