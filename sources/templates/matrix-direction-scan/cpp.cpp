void scanDirections(const std::vector<std::vector<int>>& grid, int row, int col) {
    std::vector<std::pair<int, int>> dirs{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (auto [dr, dc] : dirs) {
        int r = row + dr, c = col + dc;
        while (inside(grid, r, c)) {
            visit(r, c);
            r += dr;
            c += dc;
        }
    }
}
