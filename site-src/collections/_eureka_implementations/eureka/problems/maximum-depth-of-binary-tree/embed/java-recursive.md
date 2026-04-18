---
problem_slug: maximum-depth-of-binary-tree
problem_title: Maximum Depth of Binary Tree
problem_source_url: https://leetcode.com/problems/maximum-depth-of-binary-tree
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Maximum Depth of Binary Tree · Java Recursive
description: Maximum Depth of Binary Tree solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/MaximumDepthOfBinaryTree.java
code_language: java
detail_url: "/eureka/problems/maximum-depth-of-binary-tree/#java-recursive"
embed_url: "/eureka/problems/maximum-depth-of-binary-tree/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

public class MaximumDepthOfBinaryTree {

    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        int maxLeftDepth  = maxDepth(root.left);
        int maxRightDepth = maxDepth(root.right);
        return Math.max(maxLeftDepth, maxRightDepth) + 1;
    }

}
~~~
