---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: CheckSubTree.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/CheckSubTree.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/CheckSubTree.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/CheckSubTree.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/CheckSubTree.java
description: CheckSubTree.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

public class CheckSubTree {

    private static boolean checkSubTree(TreeNode root, TreeNode subTree) {
        return isSame(root, subTree) || checkSubTree(root.left, subTree) || checkSubTree(root.right, subTree);
    }

    private static boolean isSame(TreeNode a, TreeNode b) {
        if (a == null || b == null)
            return a == b;
        return a.val == b.val && isSame(a.left, b.left) && isSame(a.right, b.right);
    }

}
~~~
