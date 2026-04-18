---
problem_slug: move-zeroes
problem_title: Move Zeroes
problem_source_url: https://leetcode.com/problems/move-zeroes
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Move Zeroes · Scala Recursive
description: Move Zeroes solution in Scala using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/array/recursive/MoveZeroes.scala
code_language: scala
detail_url: "/eureka/problems/move-zeroes/#scala-recursive"
embed_url: "/eureka/problems/move-zeroes/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package array.recursive

import scala.annotation.tailrec

object MoveZeroes:

  extension [T](array: Array[T])

    def swap(from: Int, to: Int): Unit =
      val tmp = array(from)
      array(from) = array(to)
      array(to) = tmp

  def moveZeroes(nums: Array[Int]): Unit =

    @tailrec def loop(left: Int, right: Int): Unit =
      if right == nums.length then ()
      else if nums(right) == 0 then loop(left, right + 1)
      else
        nums.swap(left, right)
        loop(left + 1, right + 1)

    loop(0, 0)
~~~
