---
problem_slug: balanced-binary-tree
problem_title: Balanced Binary Tree
problem_source_url: https://leetcode.com/problems/balanced-binary-tree
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Balanced Binary Tree · Scala Recursive
description: Balanced Binary Tree solution in Scala using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/tree/recursive/BalancedBinaryTree.scala
code_language: scala
detail_url: "/eureka/problems/balanced-binary-tree/#scala-recursive"
embed_url: "/eureka/problems/balanced-binary-tree/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package tree.recursive

import tree.TreeNode

object BalancedBinaryTree:

  def isBalanced(_root: TreeNode): Boolean =

    def depth(root: TreeNode): Int =
      if root == null then return 0
      val leftDepth  = depth(root.left)
      val rightDepth = depth(root.right)

      if leftDepth == -1 || rightDepth == -1 then -1
      else if java.lang.Math.abs(leftDepth - rightDepth) > 1 then -1
      else java.lang.Math.max(leftDepth, rightDepth) + 1

    depth(_root) != -1
~~~
