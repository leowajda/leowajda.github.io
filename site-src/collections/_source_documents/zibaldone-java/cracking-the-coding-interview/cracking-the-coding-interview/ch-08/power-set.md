---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: PowerSet.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/PowerSet.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/PowerSet.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/PowerSet.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/PowerSet.java
description: PowerSet.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class PowerSet {

    private static List<List<Integer>> powerSet(List<Integer> nums) {
        List<List<Integer>> res = new ArrayList<>();
        helper(nums, res, 0, new ArrayDeque<>());
        return res;
    }

    private static void helper(List<Integer> nums, List<List<Integer>> res, int index, Deque<Integer> stack) {

        if (index == nums.size()) {
            res.add(new ArrayList<>(stack));
            return;
        }

        stack.push(nums.get(index));
        helper(nums, res, index + 1, stack);
        stack.pop();
        helper(nums, res, index + 1, stack);
    }

}
~~~
