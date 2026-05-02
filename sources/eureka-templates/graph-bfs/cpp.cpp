std::vector<int> distances(const std::vector<std::vector<int>>& graph, int start) {
    std::vector<int> dist(graph.size(), -1);
    std::queue<int> queue;
    dist[start] = 0;
    queue.push(start);
    while (!queue.empty()) {
        int node = queue.front();
        queue.pop();
        for (int next : graph[node]) if (dist[next] == -1) {
            dist[next] = dist[node] + 1;
            queue.push(next);
        }
    }
    return dist;
}
