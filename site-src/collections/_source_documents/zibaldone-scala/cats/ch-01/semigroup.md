---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: semigroup.scala
tree_path: src/main/scala/ch_01/semigroup.scala
source_path: cats/src/main/scala/ch_01/semigroup.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_01/semigroup.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_01
  url: ''
document_id: cats:src/main/scala/ch_01/semigroup.scala
description: semigroup.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_01

import cats.Semigroup
import cats.instances.int.*
import cats.syntax.semigroup.*

// will throw an exception on empty iterables
extension [T: Semigroup](iterable: Iterable[T])
  // ex. use extension method
  def reduceIterable: T = iterable.reduce(_ |+| _)

trait `semigroup`[A]:
  def combine(x: A, y: A): A

final case class Expense(id: Long, amount: Double)

object Expense:
  // ex. support new type
  given Semigroup[Expense] = Semigroup.instance { (a, b) => Expense(a.id |+| b.id, a.amount |+| b.amount) }
~~~
