---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: WordTransformer.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/WordTransformer.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/WordTransformer.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/WordTransformer.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/WordTransformer.java
description: WordTransformer.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.*;

public class WordTransformer {

    private static int ladderLength(String beginWord, String endWord, List<String> wordList) {

        if (beginWord.equals(endWord))
            return 0;

        Queue<String> queue        = new ArrayDeque<>(List.of(beginWord));
        Set<String> availableWords = new HashSet<>(wordList);
        availableWords.remove(beginWord);

        int level = 1;
        while (!queue.isEmpty()) {
            int n = queue.size();

            for (int i = 0; i < n; i++) {
                var candidate = queue.remove();
                if (candidate.equals(endWord)) return level;

                for (var word : wordList)
                    if (isValidNeighbor(candidate, word) && availableWords.contains(word)) {
                        availableWords.remove(word);
                        queue.add(word);
                    }
            }

            level++;
        }

        return 0;
    }

    private static boolean isValidNeighbor(String from, String to) {
        int n = from.length();
        int countDiff = 0;

        for (int i = 0; i < n; i++) {
            if (from.charAt(i) != to.charAt(i)) countDiff++;
            if (countDiff > 1) break;
        }

        return countDiff == 1;
    }

}
~~~
