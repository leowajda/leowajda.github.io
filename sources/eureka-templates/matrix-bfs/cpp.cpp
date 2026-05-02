void bfs(const std::vector<std::vector<int>>& grid, int row, int col) {
    std::vector<std::pair<int, int>> dirs{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    std::queue<std::pair<int, int>> queue;
    queue.push({row, col});
    mark(row, col);
    while (!queue.empty()) {
        auto [r, c] = queue.front();
        queue.pop();
        visit(r, c);
        for (auto [dr, dc] : dirs) {
            int nr = r + dr, nc = c + dc;
            if (inside(grid, nr, nc) && unvisited(nr, nc)) {
                mark(nr, nc);
                queue.push({nr, nc});
            }
        }
    }
}
