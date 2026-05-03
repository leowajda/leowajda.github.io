class Trie:
    def __init__(self):
        self.next = {}
        self.word = False

    def add(self, text: str) -> None:
        node = self
        for ch in text:
            node = node.next.setdefault(ch, Trie())
        node.word = True
