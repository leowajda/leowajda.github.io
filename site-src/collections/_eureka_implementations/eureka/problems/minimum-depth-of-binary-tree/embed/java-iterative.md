---
problem_slug: minimum-depth-of-binary-tree
problem_title: Minimum Depth of Binary Tree
problem_source_url: https://leetcode.com/problems/minimum-depth-of-binary-tree
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Minimum Depth of Binary Tree · Java Iterative
description: Minimum Depth of Binary Tree solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/iterative/MinimumDepthOfBinaryTree.java
code_language: java
detail_url: "/eureka/problems/minimum-depth-of-binary-tree/#java-iterative"
embed_url: "/eureka/problems/minimum-depth-of-binary-tree/embed/java-iterative/"
project_slug: eureka
---

~~~java
package tree.iterative;

import tree.TreeNode;

import java.util.Queue;
import java.util.ArrayDeque;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toCollection;

public class MinimumDepthOfBinaryTree {

    public int minDepth(TreeNode root) {

        int depth = 0;
        Queue<TreeNode> queue = Stream.ofNullable(root).collect(toCollection(ArrayDeque::new));

        while (!queue.isEmpty()) {

            depth++;
            int n = queue.size();

            for (int i = 0; i < n; i++) {
                var node = queue.remove();
                if (node.left == null && node.right == null) return depth;
                if (node.left != null)                       queue.add(node.left);
                if (node.right != null)                      queue.add(node.right);
            }

        }

        return depth;
    }

}
~~~
