---
problem_slug: subsets
problem_title: Subsets
problem_source_url: https://leetcode.com/problems/subsets
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Subsets · Java Recursive
description: Subsets solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/recursive/Subsets.java
code_language: java
detail_url: "/eureka/problems/subsets/#java-recursive"
embed_url: "/eureka/problems/subsets/embed/java-recursive/"
project_slug: eureka
---

~~~java
package array.recursive;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class Subsets {

    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> subsets = new ArrayList<>();
        backtrack(nums, 0, new ArrayDeque<>(), subsets);
        return subsets;
    }

    private void backtrack(int[] nums, int idx, Deque<Integer> deque, List<List<Integer>> subsets) {

        if (idx == nums.length) {
            var subset = new ArrayList<>(deque);
            subsets.add(subset);
            return;
        }

        deque.addLast(nums[idx]);
        backtrack(nums, idx + 1, deque, subsets);
        deque.removeLast();
        backtrack(nums, idx + 1, deque, subsets);
    }

}
~~~
