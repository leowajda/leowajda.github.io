---
problem_slug: longest-substring-without-repeating-characters
problem_title: Longest Substring Without Repeating Characters
problem_source_url: https://leetcode.com/problems/longest-substring-without-repeating-characters
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Longest Substring Without Repeating Characters · Scala Recursive
description: Longest Substring Without Repeating Characters solution in Scala using
  the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/string/recursive/LongestSubstringWithoutRepeatingCharacters.scala
code_language: scala
detail_url: "/eureka/problems/longest-substring-without-repeating-characters/#scala-recursive"
embed_url: "/eureka/problems/longest-substring-without-repeating-characters/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package string.recursive

import scala.annotation.tailrec
import scala.collection.mutable

object LongestSubstringWithoutRepeatingCharacters:

  def lengthOfLongestSubstring(s: String): Int =

    @tailrec def loop(left: Int, right: Int, longestSubstring: Int, slidingWindow: mutable.Set[Char]): Int =
      if right >= s.length then return longestSubstring
      val leftChar  = s(left)
      val rightChar = s(right)

      if !slidingWindow(rightChar) then
        loop(left, right + 1, scala.math.max(longestSubstring, right - left + 1), slidingWindow += rightChar)
      else
        loop(left + 1, right, longestSubstring, slidingWindow -= leftChar)

    loop(0, 0, 0, mutable.Set.empty)
~~~
