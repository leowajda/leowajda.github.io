---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: ValidateBST.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/ValidateBST.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/ValidateBST.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/ValidateBST.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/ValidateBST.java
description: ValidateBST.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

public class ValidateBST {

    private static boolean isValidBST(TreeNode root) {
        return helper(Integer.MIN_VALUE, root, Integer.MAX_VALUE);
    }

    private static boolean helper(int min, TreeNode node, int max) {
        if (node == null) return true;
        boolean isNodeWithinBounds  = min <= node.val && node.val < max;
        boolean isLeftWithinBounds  = helper(min, node.left, node.val);
        boolean isRightWithinBounds = helper(node.val, node.right, max);
        return isNodeWithinBounds && isLeftWithinBounds && isRightWithinBounds;
    }

}
~~~
