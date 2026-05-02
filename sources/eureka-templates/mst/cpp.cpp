int kruskal(int n, std::vector<Edge>& edges) {
    std::sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) {
        return a.weight < b.weight;
    });
    UnionFind uf(n);
    int cost = 0;
    for (const Edge& edge : edges) {
        if (uf.unite(edge.a, edge.b)) cost += edge.weight;
    }
    return cost;
}
