---
problem_slug: lowest-common-ancestor-of-a-binary-search-tree
problem_title: Lowest Common Ancestor of a Binary Search Tree
problem_source_url: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Lowest Common Ancestor of a Binary Search Tree · Scala Recursive
description: Lowest Common Ancestor of a Binary Search Tree solution in Scala using
  the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/tree/recursive/LowestCommonAncestorOfABinarySearchTree.scala
code_language: scala
detail_url: "/eureka/problems/lowest-common-ancestor-of-a-binary-search-tree/#scala-recursive"
embed_url: "/eureka/problems/lowest-common-ancestor-of-a-binary-search-tree/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package tree.recursive

import tree.TreeNode

import scala.annotation.tailrec

object LowestCommonAncestorOfABinarySearchTree:

  def lowestCommonAncestor(_root: TreeNode, p: TreeNode, q: TreeNode): TreeNode =

    @tailrec def go(root: TreeNode, min: Int, max: Int): TreeNode =
      if root == null || root.value == min || root.value == max then root
      else if min < root.value && root.value < max then root
      else go(if root.value > max then root.left else root.right, min, max)

    go(_root, math.min(p.value, q.value), math.max(p.value, q.value))
~~~
