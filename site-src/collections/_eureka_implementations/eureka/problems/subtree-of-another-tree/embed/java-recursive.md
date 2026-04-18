---
problem_slug: subtree-of-another-tree
problem_title: Subtree of Another Tree
problem_source_url: https://leetcode.com/problems/subtree-of-another-tree
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Subtree of Another Tree · Java Recursive
description: Subtree of Another Tree solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/SubtreeOfAnotherTree.java
code_language: java
detail_url: "/eureka/problems/subtree-of-another-tree/#java-recursive"
embed_url: "/eureka/problems/subtree-of-another-tree/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

public class SubtreeOfAnotherTree {

    private boolean isSame(TreeNode a, TreeNode b) {
        return (a == null || b == null) ? a == b : a.val == b.val && isSame(a.left, b.left) && isSame(a.right, b.right);
    }

    public boolean isSubtree(TreeNode root, TreeNode subRoot) {
        return root != null && (isSame(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot));
    }

}
~~~
