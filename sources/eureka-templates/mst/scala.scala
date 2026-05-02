def kruskal(n: Int, edges: Array[Array[Int]]): Int =
  val uf = new UnionFind(n)
  var cost = 0
  for edge <- edges.sortBy(_(2)) do
    if uf.union(edge(0), edge(1)) then cost += edge(2)
  cost
