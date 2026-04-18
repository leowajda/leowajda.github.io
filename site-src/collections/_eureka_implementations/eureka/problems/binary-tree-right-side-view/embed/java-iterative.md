---
problem_slug: binary-tree-right-side-view
problem_title: Binary Tree Right Side View
problem_source_url: https://leetcode.com/problems/binary-tree-right-side-view
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Binary Tree Right Side View · Java Iterative
description: Binary Tree Right Side View solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/iterative/BinaryTreeRightSideView.java
code_language: java
detail_url: "/eureka/problems/binary-tree-right-side-view/#java-iterative"
embed_url: "/eureka/problems/binary-tree-right-side-view/embed/java-iterative/"
project_slug: eureka
---

~~~java
package tree.iterative;

import tree.TreeNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.ArrayDeque;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toCollection;

public class BinaryTreeRightSideView {

    public List<Integer> rightSideView(TreeNode root) {

        List<Integer> rightSideView = new ArrayList<>();
        Queue<TreeNode> queue       = Stream.ofNullable(root).collect(toCollection(ArrayDeque::new));

        while (!queue.isEmpty()) {

            int n = queue.size();
            for (int i = 0; i < n; i++) {
                var node = queue.remove();
                if (i == n - 1)         rightSideView.add(node.val);
                if (node.left != null)  queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }

        }

        return rightSideView;
    }

}
~~~
