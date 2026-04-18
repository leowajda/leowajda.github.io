---
problem_slug: maximum-depth-of-binary-tree
problem_title: Maximum Depth of Binary Tree
problem_source_url: https://leetcode.com/problems/maximum-depth-of-binary-tree
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Maximum Depth of Binary Tree · Scala Recursive
description: Maximum Depth of Binary Tree solution in Scala using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/tree/recursive/MaximumDepthOfBinaryTree.scala
code_language: scala
detail_url: "/eureka/problems/maximum-depth-of-binary-tree/#scala-recursive"
embed_url: "/eureka/problems/maximum-depth-of-binary-tree/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package tree.recursive

import tree.TreeNode

object MaximumDepthOfBinaryTree:

  def maxDepth(root: TreeNode): Int =
    if root == null then 0 else java.lang.Math.max(maxDepth(root.left), maxDepth(root.right)) + 1
~~~
