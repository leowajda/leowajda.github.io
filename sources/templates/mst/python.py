def kruskal(n: int, edges: list[tuple[int, int, int]]) -> int:
    uf = UnionFind(n)
    cost = 0
    for a, b, weight in sorted(edges, key=lambda edge: edge[2]):
        if uf.union(a, b):
            cost += weight
    return cost
