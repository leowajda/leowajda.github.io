---
problem_slug: word-ladder
problem_title: Word Ladder
problem_source_url: https://leetcode.com/problems/word-ladder
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Word Ladder · Java Iterative
description: Word Ladder solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/graph/iterative/WordLadder.java
code_language: java
detail_url: "/eureka/problems/word-ladder/#java-iterative"
embed_url: "/eureka/problems/word-ladder/embed/java-iterative/"
project_slug: eureka
---

~~~java
package graph.iterative;

import java.util.*;

public class WordLadder {

    public int ladderLength(String beginWord, String endWord, List<String> wordList) {

        wordList.add(beginWord);
        Map<String, List<String>> graph = getGraph(wordList);
        Queue<String> queue             = new ArrayDeque<>(List.of(beginWord));
        Set<String> visited             = new HashSet<>(queue);

        int ladderLength = 1;
        while (!queue.isEmpty()) {
            int n = queue.size();
            for (int i = 0; i < n; i++) {
                var word = queue.remove();

                if (word.equals(endWord))
                    return ladderLength;

                graph.get(word)
                        .stream()
                        .filter(visited::add)
                        .forEach(queue::add);
            }
            ladderLength++;
        }

        return 0;
    }

    private Map<String, List<String>> getGraph(List<String> wordList) {
        int n = wordList.size();
        Map<String, List<String>> graph = new HashMap<>(n);

        for (int i = 0; i < n; i++) {
            var a = wordList.get(i);
            var neighsA = graph.computeIfAbsent(a, any -> new ArrayList<>());

            for (int j = i; j < n; j++) {
                var b = wordList.get(j);
                var neighsB = graph.computeIfAbsent(b, any -> new ArrayList<>());
                if (!isNeigh(a, b)) continue;
                neighsA.add(b);
                neighsB.add(a);
            }
        }

        return graph;
    }

    private boolean isNeigh(String a, String b) {
        int n = a.length(), countDiff = 0;
        for (int i = 0; i < n; i++) {
            if (a.charAt(i) != b.charAt(i)) countDiff++;
            if (countDiff > 1)              return false;
        }

        return true;
    }

}
~~~
