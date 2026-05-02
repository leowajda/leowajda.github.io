void scanDirections(int[][] grid, int row, int col) {
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int[] dir : dirs) {
        int r = row + dir[0];
        int c = col + dir[1];
        while (inside(grid, r, c)) {
            visit(r, c);
            r += dir[0];
            c += dir[1];
        }
    }
}
