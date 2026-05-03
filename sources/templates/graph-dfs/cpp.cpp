void dfs(int node, const std::vector<std::vector<int>>& graph, std::vector<bool>& seen) {
    seen[node] = true;
    visit(node);
    for (int next : graph[node]) {
        if (!seen[next]) dfs(next, graph, seen);
    }
}
