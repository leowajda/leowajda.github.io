final class SegmentTree(n: Int):
  private var size = 1
  while size < n do size *= 2
  private val tree = Array.fill(2 * size)(0)

  def set(index0: Int, value: Int): Unit =
    var index = index0 + size
    tree(index) = value
    index /= 2
    while index > 0 do
      tree(index) = merge(tree(2 * index), tree(2 * index + 1))
      index /= 2
