std::vector<int> dijkstra(const std::vector<std::vector<Edge>>& graph, int source) {
    std::vector<int> dist(graph.size(), INF);
    std::priority_queue<State, std::vector<State>, std::greater<State>> heap;
    dist[source] = 0;
    heap.push({0, source});
    while (!heap.empty()) {
        auto [cost, node] = heap.top();
        heap.pop();
        if (cost != dist[node]) continue;
        for (const Edge& edge : graph[node]) if (cost + edge.weight < dist[edge.to]) {
            dist[edge.to] = cost + edge.weight;
            heap.push({dist[edge.to], edge.to});
        }
    }
    return dist;
}
