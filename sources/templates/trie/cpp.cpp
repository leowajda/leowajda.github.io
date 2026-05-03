class Trie {
    std::unordered_map<char, Trie*> next;
    bool word = false;

public:
    void add(const std::string& text) {
        Trie* node = this;
        for (char ch : text) {
            if (!node->next.count(ch)) node->next[ch] = new Trie();
            node = node->next[ch];
        }
        node->word = true;
    }
};
