---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: PermutationsWithoutDuplicates.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/PermutationsWithoutDuplicates.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/PermutationsWithoutDuplicates.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/PermutationsWithoutDuplicates.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_08
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/PermutationsWithoutDuplicates.java
description: PermutationsWithoutDuplicates.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class PermutationsWithoutDuplicates {

    private static List<String> permute(String s) {
        List<String> permutations = new ArrayList<>();
        int n = s.length();
        helper(s, new boolean[n], permutations, new ArrayDeque<>(n));
        return permutations;
    }

    private static void helper(String s, boolean[] visited, List<String> permutations, Deque<String> stack) {

        if (stack.size() == s.length()) {
            String permutation = String.join("", stack);
            permutations.add(permutation);
            return;
        }

        for (int i = 0; i < s.length(); i++) {
            if (visited[i]) continue;
            String ch = String.valueOf(s.charAt(i));
            stack.push(ch);
            visited[i] = true;
            helper(s, visited, permutations, stack);
            stack.pop();
            visited[i] = false;
        }

    }
}
~~~
