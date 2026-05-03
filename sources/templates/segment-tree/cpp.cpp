class SegmentTree {
    int size = 1;
    std::vector<int> tree;

public:
    explicit SegmentTree(int n) {
        while (size < n) size *= 2;
        tree.assign(2 * size, 0);
    }

    void set(int index, int value) {
        index += size;
        tree[index] = value;
        for (index /= 2; index > 0; index /= 2) tree[index] = merge(tree[2 * index], tree[2 * index + 1]);
    }
};
