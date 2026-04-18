---
problem_slug: binary-search
problem_title: Binary Search
problem_source_url: https://leetcode.com/problems/binary-search
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Binary Search · Scala Recursive
description: Binary Search solution in Scala using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/array/recursive/BinarySearch.scala
code_language: scala
detail_url: "/eureka/problems/binary-search/#scala-recursive"
embed_url: "/eureka/problems/binary-search/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package array.recursive

import scala.annotation.tailrec

object BinarySearch:

  def search(nums: Array[Int], target: Int): Int =

    @tailrec def loop(start: Int, end: Int): Int =
      val mid = start + (end - start) / 2
      if start > end then -1
      else if nums(mid) == target then mid
      else if nums(mid) < target then loop(mid + 1, end)
      else loop(start, mid - 1)

    loop(0, nums.length - 1)
~~~
