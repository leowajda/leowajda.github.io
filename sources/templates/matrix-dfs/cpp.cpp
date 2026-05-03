void dfs(const std::vector<std::vector<int>>& grid, int row, int col) {
    if (!inside(grid, row, col) || seen(row, col)) return;
    mark(row, col);
    visit(row, col);
    dfs(grid, row + 1, col);
    dfs(grid, row - 1, col);
    dfs(grid, row, col + 1);
    dfs(grid, row, col - 1);
}
