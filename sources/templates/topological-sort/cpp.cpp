std::vector<int> topologicalOrder(const std::vector<std::vector<int>>& graph) {
    std::vector<int> indegree(graph.size());
    for (const auto& edges : graph) for (int next : edges) indegree[next]++;
    std::queue<int> queue;
    for (int node = 0; node < graph.size(); node++) if (indegree[node] == 0) queue.push(node);
    std::vector<int> order;
    while (!queue.empty()) {
        int node = queue.front();
        queue.pop();
        order.push_back(node);
        for (int next : graph[node]) if (--indegree[next] == 0) queue.push(next);
    }
    return order;
}
