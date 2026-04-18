---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: PairsWithSum.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/PairsWithSum.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/PairsWithSum.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/PairsWithSum.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/PairsWithSum.java
description: PairsWithSum.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class PairsWithSum {

    // problem statement not very clear how duplicate pairs should be handled
    private static List<List<Integer>> pairsWithSum(int[] nums, int target) {
        List<List<Integer>> pairs   = new ArrayList<>();
        Set<Integer> visited        = new HashSet<>();

        for (var num : nums) {
            int diff = target - num;
            if (visited.contains(diff)) pairs.add(List.of(num, diff));
            visited.add(num);
        }

        return pairs;
    }

}
~~~
