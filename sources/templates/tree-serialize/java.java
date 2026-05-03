void serialize(TreeNode node, List<String> out) {
    if (node == null) {
        out.add("#");
        return;
    }
    out.add(String.valueOf(node.value));
    serialize(node.left, out);
    serialize(node.right, out);
}
