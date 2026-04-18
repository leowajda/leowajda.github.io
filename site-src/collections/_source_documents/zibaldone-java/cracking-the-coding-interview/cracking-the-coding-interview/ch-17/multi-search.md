---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: MultiSearch.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/MultiSearch.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/MultiSearch.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/MultiSearch.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_17
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/MultiSearch.java
description: MultiSearch.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.*;

public class MultiSearch {

    // no need for a full-blown trie because problem indexes a single word -> linked list
    private static class TrieNode {

        TrieNode next;
        int idx;
        char ch;

        public TrieNode(char ch, int idx) {
            this.ch = ch;
            this.idx = idx;
        }

        public boolean contains(String s) {
            TrieNode node = this;

            for (int i = 0; i < s.length(); i++) {
                char ch = s.charAt(i);
                if (node == null || node.ch != ch) return false;
                node = node.next;
            }

            return true;
        }

        public static Map<Character, List<TrieNode>> fromString(String s) {
            Map<Character, List<TrieNode>> flattenedString = new HashMap<>();
            TrieNode prev = null;

            for (int i = 0; i < s.length(); i++) {
                char ch  = s.charAt(i);
                var node = new TrieNode(ch, i);
                var list = flattenedString.computeIfAbsent(ch, x -> new ArrayList<>());
                list.add(node);
                if (prev != null) prev.next = node;
                prev = node;
            }

            return flattenedString;
        }
    }

    private static Map<String, List<Integer>> multiSearch(String big, String[] smalls) {
        var flattenedString = TrieNode.fromString(big);
        Map<String, List<Integer>> entries = new HashMap<>();

        for (var small : smalls) {
            var list = flattenedString.getOrDefault(small.charAt(0), Collections.emptyList());
            var validEntries = list.stream().filter(n -> n.contains(small)).map(n -> n.idx).toList();
            entries.put(small, validEntries);
        }

        return entries;
    }

}
~~~
