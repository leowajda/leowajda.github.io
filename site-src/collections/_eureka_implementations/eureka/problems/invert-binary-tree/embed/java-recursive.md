---
problem_slug: invert-binary-tree
problem_title: Invert Binary Tree
problem_source_url: https://leetcode.com/problems/invert-binary-tree
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Invert Binary Tree · Java Recursive
description: Invert Binary Tree solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/InvertBinaryTree.java
code_language: java
detail_url: "/eureka/problems/invert-binary-tree/#java-recursive"
embed_url: "/eureka/problems/invert-binary-tree/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

public class InvertBinaryTree {

    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        var leftTree = invertTree(root.left);
        root.left    = invertTree(root.right);
        root.right   = leftTree;
        return root;
    }

}
~~~
