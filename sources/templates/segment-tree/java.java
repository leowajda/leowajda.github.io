class SegmentTree {
    int size;
    int[] tree;

    SegmentTree(int n) {
        size = 1;
        while (size < n) size *= 2;
        tree = new int[2 * size];
    }

    void set(int index, int value) {
        index += size;
        tree[index] = value;
        for (index /= 2; index > 0; index /= 2) tree[index] = merge(tree[2 * index], tree[2 * index + 1]);
    }
}
