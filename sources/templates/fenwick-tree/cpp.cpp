class FenwickTree {
    std::vector<int> tree;

public:
    explicit FenwickTree(int n) : tree(n + 1) {}

    void add(int index, int delta) {
        for (index++; index < tree.size(); index += index & -index) tree[index] += delta;
    }

    int sum(int index) const {
        int total = 0;
        for (index++; index > 0; index -= index & -index) total += tree[index];
        return total;
    }
};
