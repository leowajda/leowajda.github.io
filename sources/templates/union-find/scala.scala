final class UnionFind(n: Int):
  private val parent = Array.tabulate(n)(identity)
  private val size = Array.fill(n)(1)

  def find(node: Int): Int =
    if parent(node) != node then parent(node) = find(parent(node))
    parent(node)

  def union(a: Int, b: Int): Boolean =
    var ra = find(a)
    var rb = find(b)
    if ra == rb then false
    else
      if size(ra) < size(rb) then
        val t = ra
        ra = rb
        rb = t
      parent(rb) = ra
      size(ra) += size(rb)
      true
