void bfs(int[][] grid, int row, int col) {
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    ArrayDeque<int[]> queue = new ArrayDeque<>();
    queue.add(new int[] {row, col});
    mark(row, col);
    while (!queue.isEmpty()) {
        int[] cell = queue.remove();
        visit(cell[0], cell[1]);
        for (int[] dir : dirs) {
            int nr = cell[0] + dir[0], nc = cell[1] + dir[1];
            if (inside(grid, nr, nc) && unvisited(nr, nc)) {
                mark(nr, nc);
                queue.add(new int[] {nr, nc});
            }
        }
    }
}
