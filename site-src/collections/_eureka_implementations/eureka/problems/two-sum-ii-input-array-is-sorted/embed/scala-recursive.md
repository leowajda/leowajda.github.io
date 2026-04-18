---
problem_slug: two-sum-ii-input-array-is-sorted
problem_title: Two Sum II - Input Array Is Sorted
problem_source_url: https://leetcode.com/problems/two-sum-ii-input-array-is-sorted
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Two Sum II - Input Array Is Sorted · Scala Recursive
description: Two Sum II - Input Array Is Sorted solution in Scala using the recursive
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/array/recursive/TwoSumInputArrayIsSorted.scala
code_language: scala
detail_url: "/eureka/problems/two-sum-ii-input-array-is-sorted/#scala-recursive"
embed_url: "/eureka/problems/two-sum-ii-input-array-is-sorted/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package array.recursive

import scala.annotation.tailrec

object TwoSumInputArrayIsSorted:

  def twoSum(nums: Array[Int], target: Int): Array[Int] =

    @tailrec def loop(left: Int, right: Int): Array[Int] =
      if left >= right then return Array(-1, -1)
      val sum = nums(left) + nums(right)
      if sum == target then Array(left + 1, right + 1)
      else if sum > target then loop(left, right - 1)
      else loop(left + 1, right)

    loop(0, nums.length - 1)
~~~
