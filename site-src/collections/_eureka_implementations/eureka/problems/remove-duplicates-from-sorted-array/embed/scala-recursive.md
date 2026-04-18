---
problem_slug: remove-duplicates-from-sorted-array
problem_title: Remove Duplicates from Sorted Array
problem_source_url: https://leetcode.com/problems/remove-duplicates-from-sorted-array
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Remove Duplicates from Sorted Array · Scala Recursive
description: Remove Duplicates from Sorted Array solution in Scala using the recursive
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/array/recursive/RemoveDuplicatesFromSortedArray.scala
code_language: scala
detail_url: "/eureka/problems/remove-duplicates-from-sorted-array/#scala-recursive"
embed_url: "/eureka/problems/remove-duplicates-from-sorted-array/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package array.recursive

import scala.annotation.tailrec

object RemoveDuplicatesFromSortedArray:

  def removeDuplicates(nums: Array[Int]): Int =

    @tailrec def loop(left: Int, right: Int): Int =
      if right == nums.length then left + 1
      else if nums(left) == nums(right) then loop(left, right + 1)
      else
        nums(left + 1) = nums(right)
        loop(left + 1, right + 1)

    loop(0, 0)
~~~
