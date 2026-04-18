---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: LRUCache.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/LRUCache.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/LRUCache.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/LRUCache.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_16
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/LRUCache.java
description: LRUCache.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

import java.util.HashMap;
import java.util.Map;

public class LRUCache {

    private static class Node {
        Node prev, next;
        Integer key, value;

        public Node(Integer key, Integer value) {
            this.value = value;
            this.key = key;
        }

        public void link(Node prev, Node next) {
            this.prev = prev;
            this.next = next;
            prev.next = this;
            next.prev = this;
        }

        public void unlink() {
            Node prev = this.prev;
            Node next = this.next;

            this.prev = null;
            this.next = null;

            prev.next = next;
            next.prev = prev;
        }

    }

    private final Map<Integer, Node> lruCache;
    private final Node leastUsed;
    private final Node mostUsed;
    private final int maxSize;
    private int currSize;

    public LRUCache(int maxSize) {
        this.lruCache   = new HashMap<>(maxSize);
        this.maxSize    = maxSize;
        this.currSize   = 0;
        this.leastUsed  = new Node(-1, -1);
        this.mostUsed   = new Node(-1, -1);
        leastUsed.next  = mostUsed;
        mostUsed.prev   = leastUsed;
    }

    private void addEntry(Integer key, Integer value) {
        var entry = new Node(key, value);
        entry.link(mostUsed.prev, mostUsed);
        lruCache.put(key, entry);
    }

    public int get(int key) {
        if (!lruCache.containsKey(key)) return -1;

        var entry = lruCache.get(key);
        entry.unlink();
        entry.link(mostUsed.prev, mostUsed);
        return entry.value;
    }

    public void put(int key, int value) {
        if (currSize < maxSize && !lruCache.containsKey(key)) {
            addEntry(key, value);
            currSize++;
            return;
        }

        if (currSize <= maxSize && lruCache.containsKey(key)) {
            var prevEntry = lruCache.get(key);
            prevEntry.value = value;
            prevEntry.unlink();
            prevEntry.link(mostUsed.prev, mostUsed);
            return;
        }

        var leastRecentlyUsed = leastUsed.next;
        leastRecentlyUsed.unlink();
        lruCache.remove(leastRecentlyUsed.key);
        addEntry(key, value);
    }

}
~~~
