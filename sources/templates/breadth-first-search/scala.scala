def bfs(root: TreeNode): Unit =
  val queue = scala.collection.mutable.Queue[TreeNode]()
  if root != null then queue.enqueue(root)
  while queue.nonEmpty do
    val node = queue.dequeue()
    visit(node)
    if node.left != null then queue.enqueue(node.left)
    if node.right != null then queue.enqueue(node.right)
