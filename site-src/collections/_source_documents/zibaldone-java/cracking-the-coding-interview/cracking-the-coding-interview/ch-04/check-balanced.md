---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: CheckBalanced.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/CheckBalanced.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/CheckBalanced.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/CheckBalanced.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/CheckBalanced.java
description: CheckBalanced.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

public class CheckBalanced {

    private static final int IMBALANCED_TREE_MARKER = Integer.MAX_VALUE;

    private static boolean isBalanced(TreeNode root) {
        return helper(root) != IMBALANCED_TREE_MARKER;
    }

    private static int helper(TreeNode root) {
        if (root == null)
            return 0;

        int leftDepth = helper(root.left);
        if (leftDepth == IMBALANCED_TREE_MARKER)  return leftDepth;

        int rightDepth = helper(root.right);
        if (rightDepth == IMBALANCED_TREE_MARKER) return rightDepth;

        int absDiff = Math.abs(leftDepth - rightDepth);
        return absDiff > 1 ? IMBALANCED_TREE_MARKER : Math.max(leftDepth, rightDepth) + 1;
    }

}
~~~
