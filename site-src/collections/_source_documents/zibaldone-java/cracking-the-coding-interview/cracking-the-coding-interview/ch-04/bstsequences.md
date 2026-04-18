---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: BSTSequences.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/BSTSequences.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/BSTSequences.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/BSTSequences.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/BSTSequences.java
description: BSTSequences.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

import java.util.ArrayList;
import java.util.List;

public class BSTSequences {

    private static List<List<Integer>> bstSequences(TreeNode root) {
        List<List<Integer>> bstSequences = new ArrayList<>();

        if (root == null) {
            bstSequences.add(new ArrayList<>());
            return bstSequences;
        }

        var leftBstSequences  = bstSequences(root.left);
        var rightBstSequences = bstSequences(root.right);

        for (var leftBstSequence: leftBstSequences)
            for (var rightBstSequence: rightBstSequences) {
                List<Integer> prefix = new ArrayList<>(List.of(root.val));
                backtrack(bstSequences, leftBstSequence, 0, rightBstSequence, 0, prefix);
            }

        return bstSequences;
    }

    private static void backtrack(List<List<Integer>> result, List<Integer> left, int leftPtr, List<Integer> right, int rightPtr, List<Integer> prefix) {

        if (leftPtr == left.size() && rightPtr == right.size()) {
            result.add(new ArrayList<>(prefix));
            return;
        }

        if (leftPtr < left.size()) {
            int leftVal = left.get(leftPtr);
            prefix.addLast(leftVal);
            backtrack(result, left, leftPtr + 1, right, rightPtr, prefix);
            prefix.removeLast();
        }

        if (rightPtr < right.size()) {
            int rightVal = right.get(rightPtr);
            prefix.addLast(rightVal);
            backtrack(result, left, leftPtr, right, rightPtr + 1, prefix);
            prefix.removeLast();
        }

    }

}
~~~
