int[] dijkstra(List<List<Edge>> graph, int source) {
    int[] dist = new int[graph.size()];
    Arrays.fill(dist, INF);
    PriorityQueue<int[]> heap = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
    dist[source] = 0;
    heap.add(new int[] {source, 0});
    while (!heap.isEmpty()) {
        int[] state = heap.remove();
        if (state[1] != dist[state[0]]) continue;
        for (Edge edge : graph.get(state[0])) if (state[1] + edge.weight < dist[edge.to]) {
            dist[edge.to] = state[1] + edge.weight;
            heap.add(new int[] {edge.to, dist[edge.to]});
        }
    }
    return dist;
}
