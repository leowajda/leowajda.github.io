class FenwickTree {
    int[] tree;

    FenwickTree(int n) {
        tree = new int[n + 1];
    }

    void add(int index, int delta) {
        for (index++; index < tree.length; index += index & -index) tree[index] += delta;
    }

    int sum(int index) {
        int total = 0;
        for (index++; index > 0; index -= index & -index) total += tree[index];
        return total;
    }
}
