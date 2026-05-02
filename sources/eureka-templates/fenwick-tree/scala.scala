final class FenwickTree(n: Int):
  private val tree = Array.fill(n + 1)(0)

  def add(index0: Int, delta: Int): Unit =
    var index = index0 + 1
    while index < tree.length do
      tree(index) += delta
      index += index & -index

  def sum(index0: Int): Int =
    var index = index0 + 1
    var total = 0
    while index > 0 do
      total += tree(index)
      index -= index & -index
    total
