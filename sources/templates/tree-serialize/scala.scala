def serialize(node: TreeNode, out: scala.collection.mutable.Buffer[String]): Unit =
  if node == null then out += "#"
  else
    out += node.value.toString
    serialize(node.left, out)
    serialize(node.right, out)
