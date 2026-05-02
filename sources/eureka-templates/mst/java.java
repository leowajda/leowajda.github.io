int kruskal(int n, int[][] edges) {
    Arrays.sort(edges, Comparator.comparingInt(edge -> edge[2]));
    UnionFind uf = new UnionFind(n);
    int cost = 0;
    for (int[] edge : edges) {
        if (uf.union(edge[0], edge[1])) cost += edge[2];
    }
    return cost;
}
