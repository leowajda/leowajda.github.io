class Trie {
    Map<Character, Trie> next = new HashMap<>();
    boolean word;

    void add(String text) {
        Trie node = this;
        for (char ch : text.toCharArray()) node = node.next.computeIfAbsent(ch, key -> new Trie());
        node.word = true;
    }
}
