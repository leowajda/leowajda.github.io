List<Integer> topologicalOrder(List<List<Integer>> graph) {
    int[] indegree = new int[graph.size()];
    for (List<Integer> edges : graph) for (int next : edges) indegree[next]++;
    ArrayDeque<Integer> queue = new ArrayDeque<>();
    for (int node = 0; node < graph.size(); node++) if (indegree[node] == 0) queue.add(node);
    List<Integer> order = new ArrayList<>();
    while (!queue.isEmpty()) {
        int node = queue.remove();
        order.add(node);
        for (int next : graph.get(node)) if (--indegree[next] == 0) queue.add(next);
    }
    return order;
}
