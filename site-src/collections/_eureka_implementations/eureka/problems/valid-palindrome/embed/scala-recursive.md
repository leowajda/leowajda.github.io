---
problem_slug: valid-palindrome
problem_title: Valid Palindrome
problem_source_url: https://leetcode.com/problems/valid-palindrome
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Valid Palindrome · Scala Recursive
description: Valid Palindrome solution in Scala using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/string/recursive/ValidPalindrome.scala
code_language: scala
detail_url: "/eureka/problems/valid-palindrome/#scala-recursive"
embed_url: "/eureka/problems/valid-palindrome/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package string.recursive

import scala.annotation.tailrec

object ValidPalindrome:

  def isPalindrome(s: String): Boolean =

    @tailrec def loop(left: Int, right: Int): Boolean =
      if left >= right then return true

      val lChar = s(left)
      val rChar = s(right)
      if !lChar.isLetterOrDigit then loop(left + 1, right)
      else if !rChar.isLetterOrDigit then loop(left, right - 1)
      else if lChar.toLower == rChar.toLower then loop(left + 1, right - 1)
      else false

    loop(0, s.length - 1)
~~~
