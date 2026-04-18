---
problem_slug: balanced-binary-tree
problem_title: Balanced Binary Tree
problem_source_url: https://leetcode.com/problems/balanced-binary-tree
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Balanced Binary Tree · Java Recursive
description: Balanced Binary Tree solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/BalancedBinaryTree.java
code_language: java
detail_url: "/eureka/problems/balanced-binary-tree/#java-recursive"
embed_url: "/eureka/problems/balanced-binary-tree/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

public class BalancedBinaryTree {

    private static final int IMBALANCED_TREE = -1;

    private int helper(TreeNode root) {
        if (root == null)
            return 0;

        int leftDepth = helper(root.left);
        if (leftDepth == IMBALANCED_TREE)
            return IMBALANCED_TREE;

        int rightDepth = helper(root.right);
        if (rightDepth == IMBALANCED_TREE)
            return IMBALANCED_TREE;

        if (Math.abs(rightDepth - leftDepth) > 1)
            return IMBALANCED_TREE;

        return Math.max(rightDepth, leftDepth) + 1;
    }

    public boolean isBalanced(TreeNode root) {
        return helper(root) != IMBALANCED_TREE;
    }

}
~~~
