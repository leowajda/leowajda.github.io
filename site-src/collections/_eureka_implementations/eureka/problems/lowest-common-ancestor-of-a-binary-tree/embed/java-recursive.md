---
problem_slug: lowest-common-ancestor-of-a-binary-tree
problem_title: Lowest Common Ancestor of a Binary Tree
problem_source_url: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Lowest Common Ancestor of a Binary Tree · Java Recursive
description: Lowest Common Ancestor of a Binary Tree solution in Java using the recursive
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/LowestCommonAncestorOfABinaryTree.java
code_language: java
detail_url: "/eureka/problems/lowest-common-ancestor-of-a-binary-tree/#java-recursive"
embed_url: "/eureka/problems/lowest-common-ancestor-of-a-binary-tree/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

public class LowestCommonAncestorOfABinaryTree {

    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode a, TreeNode b) {
        if (root == null || root.val == a.val || root.val == b.val) return root;
        var left  = lowestCommonAncestor(root.left, a, b);
        var right = lowestCommonAncestor(root.right, a, b);
        return (left != null && right != null) ? root : (left != null ? left : right);
    }

}
~~~
