---
problem_slug: middle-of-the-linked-list
problem_title: Middle of the Linked List
problem_source_url: https://leetcode.com/problems/middle-of-the-linked-list
implementation_id: scala-recursive
language: scala
language_label: Scala
approach: recursive
approach_label: Recursive
title: Middle of the Linked List · Scala Recursive
description: Middle of the Linked List solution in Scala using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/scala/src/main/scala/linked_list/recursive/MiddleOfTheLinkedList.scala
code_language: scala
detail_url: "/eureka/problems/middle-of-the-linked-list/#scala-recursive"
embed_url: "/eureka/problems/middle-of-the-linked-list/embed/scala-recursive/"
project_slug: eureka
---

~~~scala
package com.eureka
package linked_list.recursive

import linked_list.ListNode

import scala.annotation.tailrec

object MiddleOfTheLinkedList:

  def middleNode(head: ListNode): ListNode =
    @tailrec def loop(slow: ListNode, fast: ListNode): ListNode =
      if fast == null || fast.next == null then slow else loop(slow.next, fast.next.next)
    loop(head, head)
~~~
