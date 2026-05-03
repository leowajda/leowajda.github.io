void dfs(int node, List<List<Integer>> graph, boolean[] seen) {
    seen[node] = true;
    visit(node);
    for (int next : graph.get(node)) {
        if (!seen[next]) dfs(next, graph, seen);
    }
}
