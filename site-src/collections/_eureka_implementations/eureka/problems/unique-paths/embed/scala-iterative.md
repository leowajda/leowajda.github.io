---
problem_slug: unique-paths
problem_title: Unique Paths
problem_source_url: https://leetcode.com/problems/unique-paths
implementation_id: scala-iterative
language: scala
language_label: Scala
approach: iterative
approach_label: Iterative
title: Unique Paths · Scala Iterative
description: Unique Paths solution in Scala using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/array/iterative/UniquePaths.scala
code_language: scala
detail_url: "/eureka/problems/unique-paths/#scala-iterative"
embed_url: "/eureka/problems/unique-paths/embed/scala-iterative/"
project_slug: eureka
---

~~~scala
package com.eureka
package array.iterative

object UniquePaths:

  def uniquePaths(rows: Int, cols: Int): Int =
    val memo = Array.fill(cols)(1)

    for
      _   <- 1 until rows
      col <- 1 until cols
    do memo(col) += memo(col - 1)

    memo(cols - 1)
~~~
