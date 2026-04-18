---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: monoid.scala
tree_path: src/main/scala/ch_01/monoid.scala
source_path: cats/src/main/scala/ch_01/monoid.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_01/monoid.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_01
  url: ''
document_id: cats:src/main/scala/ch_01/monoid.scala
description: monoid.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_01

import cats.Monoid
import cats.instances.int.*
import cats.syntax.monoid.*

extension [T: Monoid as monoid](iterable: Iterable[T])
  // ex. implement combineFold
  def foldIterable: T = iterable.fold(monoid.empty)(_ |+| _)

trait `monoid`[A] extends ch_01.`semigroup`[A]:
  def empty: A

// ex. combine a list of phonebooks as Map[String, Int]
import cats.instances.map.*

val phoneBookA = Map[String, Int]("a" -> 1, "b" -> 2)
val phoneBookB = Map[String, Int]("c" -> 3, "a" -> 2)
val phoneBookC = List(phoneBookA, phoneBookB).foldIterable // "a" -> 3

// ex. shopping cart and online stores
final case class ShoppingCart(items: List[String], total: Double)

object ShoppingCart:

  given Monoid[ShoppingCart] = Monoid.instance(
    emptyValue = ShoppingCart(Nil, 0.0),
    cmb = (a, b) => ShoppingCart(a.items |+| b.items, a.total |+| b.total)
  )

  def checkout(shoppingCarts: List[ShoppingCart]): ShoppingCart = shoppingCarts.foldIterable
~~~
