---
problem_slug: permutations
problem_title: Permutations
problem_source_url: https://leetcode.com/problems/permutations
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Permutations · Java Recursive
description: Permutations solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/recursive/Permutations.java
code_language: java
detail_url: "/eureka/problems/permutations/#java-recursive"
embed_url: "/eureka/problems/permutations/embed/java-recursive/"
project_slug: eureka
---

~~~java
package array.recursive;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class Permutations {

    private static final int VISITED_MARKER = Integer.MIN_VALUE;

    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> permutations = new ArrayList<>();
        backtrack(nums, new ArrayDeque<>(), permutations);
        return permutations;
    }

    private void backtrack(int[] nums, Deque<Integer> deque, List<List<Integer>> permutations) {

        if (deque.size() == nums.length) {
            var permutation = new ArrayList<>(deque);
            permutations.add(permutation);
            return;
        }

        for (int end = 0; end < nums.length; end++) {
            if (nums[end] == VISITED_MARKER) continue;

            deque.addLast(nums[end]);
            nums[end] = VISITED_MARKER;
            backtrack(nums, deque, permutations);
            nums[end] = deque.removeLast();
        }

    }

}
~~~
