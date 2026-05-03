boolean contains(TreeNode node, int target) {
    while (node != null) {
        if (node.value == target) return true;
        node = target < node.value ? node.left : node.right;
    }
    return false;
}
