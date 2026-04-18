---
problem_slug: lowest-common-ancestor-of-a-binary-search-tree
problem_title: Lowest Common Ancestor of a Binary Search Tree
problem_source_url: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Lowest Common Ancestor of a Binary Search Tree · Java Recursive
description: Lowest Common Ancestor of a Binary Search Tree solution in Java using
  the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/LowestCommonAncestorOfABinarySearchTree.java
code_language: java
detail_url: "/eureka/problems/lowest-common-ancestor-of-a-binary-search-tree/#java-recursive"
embed_url: "/eureka/problems/lowest-common-ancestor-of-a-binary-search-tree/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

public class LowestCommonAncestorOfABinarySearchTree {

    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode a, TreeNode b) {
        return helper(root, Math.min(a.val, b.val) , Math.max(a.val, b.val));
    }

    private TreeNode helper(TreeNode root, int low, int high) {
        if (root == null || root.val == low || root.val == high) return root;
        if (low < root.val && root.val < high)                   return root;
        return helper(root.val > high ? root.left : root.right, low, high);
    }

}
~~~
