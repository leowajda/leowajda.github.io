---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: BabyNames.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/BabyNames.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/BabyNames.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/BabyNames.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/BabyNames.java
description: BabyNames.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.*;

public class BabyNames {

    private static class UnionFind {
        private final Map<String, String> dsu;

        public UnionFind(int maxCapacity) {
            this.dsu = new HashMap<>(maxCapacity);
        }

        public void insert(String x, String y) {
            dsu.put(find(x), find(y));
        }

        public String find(String x) {
            String y = dsu.getOrDefault(x, x);
            if (y != x) {
                y = find(y);
                dsu.put(x, y);
            }
            return y;
        }

    }

    private static Map<String, Integer> babyNames(Map<String, Integer> names, List<List<String>> synonyms) {

        var dsu = new UnionFind(names.size());
        for (var synonym : synonyms)
            dsu.insert(synonym.getFirst(), synonym.getLast());

        Map<String, Integer> nameToFrequency = new HashMap<>();
        Set<String> visited = new HashSet<>();

        for (var entry : names.entrySet()) {
            String name = entry.getKey();
            int frequency = entry.getValue();

            if (!visited.add(name)) continue;

            var root = dsu.find(name);
            nameToFrequency.merge(root, frequency, Integer::sum);
        }

        return nameToFrequency;
    }

}
~~~
