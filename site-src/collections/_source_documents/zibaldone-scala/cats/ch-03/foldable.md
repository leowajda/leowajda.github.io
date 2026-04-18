---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: foldable.scala
tree_path: src/main/scala/ch_03/foldable.scala
source_path: cats/src/main/scala/ch_03/foldable.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_03/foldable.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_03
  url: ''
document_id: cats:src/main/scala/ch_03/foldable.scala
description: foldable.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_03

// foldRight in cats is stack-safe
import cats.{Eval, Foldable, Monoid}

object list:

  // ex. implement in terms of fold
  def map[A, B](list: List[A])(f: A => B): List[B]           = list.foldRight(Nil) { (a, b) => f(a) :: b }
  def flatMap[A, B](list: List[A])(f: A => List[B]): List[B] = list.foldLeft(Nil) { (b, a) => b ++ f(a) }
  def filter[A](list: List[A])(f: A => Boolean): List[A]     = list.foldRight(Nil) { (a, b) => if f(a) then a :: b else b }
  def combineAll[A: Monoid as monoid](list: List[A]): A      = list.foldLeft(monoid.empty)(monoid.combine)

def combineAll[F[_]: Foldable as ff, M[_]: Foldable as mf, A: Monoid](container: F[M[A]]): A =
  ff.compose[M](using mf).combineAll(container)

trait `foldable`[F[_]]:

  def foldLeft[A, B](fa: F[A], b: B)(f: (B, A) => B): B
  def foldRight[A, B](fa: F[A], b: Eval[B])(f: (A, Eval[B]) => Eval[B]): Eval[B]
~~~
