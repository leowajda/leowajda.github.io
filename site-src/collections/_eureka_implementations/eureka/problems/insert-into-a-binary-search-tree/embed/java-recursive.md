---
problem_slug: insert-into-a-binary-search-tree
problem_title: Insert into a Binary Search Tree
problem_source_url: https://leetcode.com/problems/insert-into-a-binary-search-tree
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Insert into a Binary Search Tree · Java Recursive
description: Insert into a Binary Search Tree solution in Java using the recursive
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/InsertIntoABinarySearchTree.java
code_language: java
detail_url: "/eureka/problems/insert-into-a-binary-search-tree/#java-recursive"
embed_url: "/eureka/problems/insert-into-a-binary-search-tree/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

public class InsertIntoABinarySearchTree {

    public TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null)   return new TreeNode(val);
        if (val > root.val) root.right = insertIntoBST(root.right, val);
        if (val < root.val) root.left = insertIntoBST(root.left, val);
        return root;
    }

}
~~~
