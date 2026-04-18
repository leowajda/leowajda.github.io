---
problem_slug: construct-binary-tree-from-preorder-and-inorder-traversal
problem_title: Construct Binary Tree from Preorder and Inorder Traversal
problem_source_url: https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Construct Binary Tree from Preorder and Inorder Traversal · Java Recursive
description: Construct Binary Tree from Preorder and Inorder Traversal solution in
  Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/ConstructBinaryTreeFromPreorderAndInorderTraversal.java
code_language: java
detail_url: "/eureka/problems/construct-binary-tree-from-preorder-and-inorder-traversal/#java-recursive"
embed_url: "/eureka/problems/construct-binary-tree-from-preorder-and-inorder-traversal/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

import java.util.HashMap;
import java.util.Map;

public class ConstructBinaryTreeFromPreorderAndInorderTraversal {

    private int currIdx;

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        int n = inorder.length;
        this.currIdx = 0;

        Map<Integer, Integer> inorderMap = new HashMap<>(n);
        for (int idx = 0; idx < n; idx++)
            inorderMap.put(inorder[idx], idx);

        return helper(0, n - 1, preorder, inorderMap);
    }

    private TreeNode helper(int lowIdx, int highIdx, int[] preorder, Map<Integer, Integer> inorderMap) {

        if (lowIdx > highIdx) return null;

        int num = preorder[currIdx++];
        int inorderIdx = inorderMap.get(num);

        var root = new TreeNode(num);
        root.left = helper(lowIdx, inorderIdx - 1, preorder, inorderMap);
        root.right = helper(inorderIdx + 1, highIdx, preorder, inorderMap);

        return root;
    }

}
~~~
