---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: state.scala
tree_path: src/main/scala/ch_02/state.scala
source_path: cats/src/main/scala/ch_02/state.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_02/state.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_02
  url: ''
document_id: cats:src/main/scala/ch_02/state.scala
description: state.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_02

import cats.data.State

// iterative computations without mutations
// S => (S, A)
def compute(num: Int): (String, String) =
  var a                 = num
  a += 1
  val firstComputation  = s"Added ${1} obtained $a"
  a *= 5
  val secondComputation = s"Multiplied with ${5}, obtained $a"
  (firstComputation, secondComputation)

val compute: State[Int, (String, String)] =
  for
    firstComputation  <- State[Int, String] { num => (num + 1, s"Added ${1} obtained ${num + 1}") }
    secondComputation <- State[Int, String] { num => (num * 5, s"Multiplied with ${5}, obtained ${num * 5}") }
  yield (firstComputation, secondComputation)

// ex. shopping cart
final case class ShoppingCart(items: List[String], total: Double)

object ShoppingCart:

  val empty: ShoppingCart = ShoppingCart(Nil, 0.0)

  def addToCart(item: String, price: Double): State[ShoppingCart, Double] = State { shoppingCart =>
    (ShoppingCart(item :: shoppingCart.items, shoppingCart.total + price), shoppingCart.total + price)
  }

// ex. mental gymnastic
def inspect[A, B](f: A => B): State[A, B] = State { s => (s, f(s)) }
def get[A]: State[A, A]                   = State { s => (s, s) }
def set[A](a: A): State[A, Unit]          = State { _ => (a, ()) }
def modify[A](f: A => A): State[A, Unit]  = State { s => (f(s), ()) }

// sequential imperative computation reduced to pure functional programming
def program: State[Int, (Int, Int, Int)] =
  for
    a <- get[Int]
    _ <- set[Int](a + 10)
    b <- get[Int]
    _ <- modify[Int](_ + 43)
    c <- inspect[Int, Int](_ * 2)
  yield (a, b, c)
~~~
