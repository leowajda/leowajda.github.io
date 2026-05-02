def contains(node0: TreeNode, target: Int): Boolean =
  var node = node0
  while node != null do
    if node.value == target then return true
    node = if target < node.value then node.left else node.right
  false
