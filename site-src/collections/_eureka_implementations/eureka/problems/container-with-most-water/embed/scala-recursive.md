---
problem_slug: container-with-most-water
problem_title: Container With Most Water
problem_source_url: https://leetcode.com/problems/container-with-most-water
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Container With Most Water · Scala Recursive
description: Container With Most Water solution in Scala using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/array/recursive/ContainerWithMostWater.scala
code_language: scala
detail_url: "/eureka/problems/container-with-most-water/#scala-recursive"
embed_url: "/eureka/problems/container-with-most-water/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package array.recursive

import scala.annotation.tailrec

object ContainerWithMostWater:

  extension (container: Array[Int])

    def area(from: Int, to: Int): Int =
      val min = if container(from) <= container(to) then from else to
      container(min) * (to - from)

  def maxArea(container: Array[Int]): Int =

    @tailrec def loop(left: Int, right: Int, maxArea: Int): Int =
      if left > right then return maxArea
      val currArea = container.area(left, right)
      if container(left) <= container(right) then loop(left + 1, right, maxArea max currArea)
      else loop(left, right - 1, maxArea max currArea)

    loop(0, container.length - 1, 0)
~~~
