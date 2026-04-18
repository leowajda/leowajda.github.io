---
problem_slug: validate-binary-search-tree
problem_title: Validate Binary Search Tree
problem_source_url: https://leetcode.com/problems/validate-binary-search-tree
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Validate Binary Search Tree · Java Recursive
description: Validate Binary Search Tree solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/ValidateBinarySearchTree.java
code_language: java
detail_url: "/eureka/problems/validate-binary-search-tree/#java-recursive"
embed_url: "/eureka/problems/validate-binary-search-tree/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

public class ValidateBinarySearchTree {

    private boolean isValidBST(long min, TreeNode curr, long max) {
        return curr == null || ((min < curr.val && curr.val < max) && isValidBST(min, curr.left, curr.val) && isValidBST(curr.val, curr.right, max));
    }

    public boolean isValidBST(TreeNode root) {
        return isValidBST(Long.MIN_VALUE, root, Long.MAX_VALUE);
    }

}
~~~
