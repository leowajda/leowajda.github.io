---
problem_slug: find-all-anagrams-in-a-string
problem_title: Find All Anagrams in a String
problem_source_url: https://leetcode.com/problems/find-all-anagrams-in-a-string
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Find All Anagrams in a String · Scala Recursive
description: Find All Anagrams in a String solution in Scala using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/string/recursive/FindAllAnagramsInAString.scala
code_language: scala
detail_url: "/eureka/problems/find-all-anagrams-in-a-string/#scala-recursive"
embed_url: "/eureka/problems/find-all-anagrams-in-a-string/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package string.recursive

import scala.annotation.tailrec

object FindAllAnagramsInAString:

  extension (s: String)

    def characterCount(end: Int): Array[Int] =
      val counter = new Array[Int](26)
      (0 until end).foreach(idx => counter(s(idx) - 'a') += 1)
      counter

  def findAnagrams(s: String, p: String): List[Int] =

    if p.length > s.length then return Nil

    val anagramSize   = p.length
    val anagramCount  = p.characterCount(anagramSize)
    val slidingWindow = s.characterCount(anagramSize - 1)

    @tailrec def loop(left: Int, right: Int, anagrams: List[Int]): List[Int] =
      if right >= s.length then return anagrams
      slidingWindow(s(right) - 'a') += 1
      val isValidAnagram = java.util.Arrays.equals(slidingWindow, anagramCount)
      slidingWindow(s(left) - 'a') -= 1
      loop(left + 1, right + 1, if isValidAnagram then left :: anagrams else anagrams)

    loop(0, anagramSize - 1, Nil)
~~~
