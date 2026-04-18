---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: PathsWithSum.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/PathsWithSum.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/PathsWithSum.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/PathsWithSum.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_04
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/PathsWithSum.java
description: PathsWithSum.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

import java.util.HashMap;
import java.util.Map;

public class PathsWithSum {

    public int pathSum(TreeNode root, int targetSum) {
        return helper(root, 0, targetSum, new HashMap<>());
    }

    private int helper(TreeNode root, int prefixSum, int targetSum, Map<Integer, Integer> counter) {
        if (root == null) return 0;
        prefixSum += root.val;

        int count = counter.getOrDefault(prefixSum - targetSum, 0);
        count += prefixSum == targetSum ? 1 : 0;

        counter.merge(prefixSum, 1, Integer::sum);
        count += helper(root.left, prefixSum, targetSum, counter);
        count += helper(root.right, prefixSum, targetSum, counter);
        counter.merge(prefixSum, -1, Integer::sum);

        return count;
    }

}
~~~
