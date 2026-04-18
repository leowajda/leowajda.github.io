---
problem_slug: letter-combinations-of-a-phone-number
problem_title: Letter Combinations of a Phone Number
problem_source_url: https://leetcode.com/problems/letter-combinations-of-a-phone-number
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Letter Combinations of a Phone Number · Scala Recursive
description: Letter Combinations of a Phone Number solution in Scala using the recursive
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/string/recursive/LetterCombinationsOfAPhoneNumber.scala
code_language: scala
detail_url: "/eureka/problems/letter-combinations-of-a-phone-number/#scala-recursive"
embed_url: "/eureka/problems/letter-combinations-of-a-phone-number/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package string.recursive

object LetterCombinationsOfAPhoneNumber:

  private val phone = Map(
    '2' -> List("a", "b", "c"),
    '3' -> List("d", "e", "f"),
    '4' -> List("g", "h", "i"),
    '5' -> List("j", "k", "l"),
    '6' -> List("m", "n", "o"),
    '7' -> List("p", "q", "r", "s"),
    '8' -> List("t", "u", "v"),
    '9' -> List("w", "x", "y", "z")
  );

  def letterCombinations(digits: String): List[String] = digits match
    case digit if digit.length <= 1 => digit.headOption.fold(Nil)(phone)
    case digits                     =>
      for
        tailCombination <- letterCombinations(digits.tail)
        letter          <- phone(digits.head)
      yield s"$letter$tailCombination"
~~~
