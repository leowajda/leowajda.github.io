int[] distances(List<List<Integer>> graph, int start) {
    int[] dist = new int[graph.size()];
    Arrays.fill(dist, -1);
    ArrayDeque<Integer> queue = new ArrayDeque<>();
    dist[start] = 0;
    queue.add(start);
    while (!queue.isEmpty()) {
        int node = queue.remove();
        for (int next : graph.get(node)) if (dist[next] == -1) {
            dist[next] = dist[node] + 1;
            queue.add(next);
        }
    }
    return dist;
}
