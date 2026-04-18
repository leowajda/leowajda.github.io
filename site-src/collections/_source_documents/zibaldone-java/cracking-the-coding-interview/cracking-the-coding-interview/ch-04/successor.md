---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: Successor.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/Successor.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/Successor.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/Successor.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/Successor.java
description: Successor.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

public class Successor {

    private static TreeNode inOrderSuccessor(TreeNode node) {
        if (node == null) return null;

        if (node.right != null)
            return bstMinimum(node.right);

        TreeNode parent = node.parent, child = node;
        while (parent != null && child == parent.right) {
            child  = parent;
            parent = parent.parent;
        }

        return parent;
    }

    private static TreeNode bstMinimum(TreeNode root) {
        TreeNode node = root;
        while (node.left != null)
            node = node.left;
        return node;
    }

}
~~~
