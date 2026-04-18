---
problem_slug: combination-sum
problem_title: Combination Sum
problem_source_url: https://leetcode.com/problems/combination-sum
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Combination Sum · Java Recursive
description: Combination Sum solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/recursive/CombinationSum.java
code_language: java
detail_url: "/eureka/problems/combination-sum/#java-recursive"
embed_url: "/eureka/problems/combination-sum/embed/java-recursive/"
project_slug: eureka
---

~~~java
package array.recursive;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class CombinationSum {

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> combinations = new ArrayList<>();
        backtrack(candidates, 0, target, new ArrayDeque<>(), combinations);
        return combinations;
    }

    private void backtrack(int[] candidates, int start, int target, Deque<Integer> deque, List<List<Integer>> combinations) {

        if (target == 0) {
            var combination = new ArrayList<>(deque);
            combinations.add(combination);
            return;
        }

        for (int end = start; end < candidates.length; end++) {
            if (target - candidates[end] < 0) continue;
            deque.addLast(candidates[end]);
            backtrack(candidates, end, target - candidates[end], deque, combinations);
            deque.removeLast();
        }

    }

}
~~~
