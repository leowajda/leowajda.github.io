class SegmentTree:
    def __init__(self, n: int):
        self.size = 1
        while self.size < n:
            self.size *= 2
        self.tree = [0] * (2 * self.size)

    def set(self, index: int, value: int) -> None:
        index += self.size
        self.tree[index] = value
        index //= 2
        while index:
            self.tree[index] = merge(self.tree[2 * index], self.tree[2 * index + 1])
            index //= 2
