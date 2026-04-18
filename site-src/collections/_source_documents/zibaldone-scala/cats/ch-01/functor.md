---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: functor.scala
tree_path: src/main/scala/ch_01/functor.scala
source_path: cats/src/main/scala/ch_01/functor.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_01/functor.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_01
  url: ''
document_id: cats:src/main/scala/ch_01/functor.scala
description: functor.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_01

import cats.Functor
import cats.syntax.functor.*

extension [F[_]: Functor as functor, A](container: F[A])
  // ex. use extension method
  def mapContainer[B](f: A => B): F[B] = container.map(f)

// a.k.a the covariant functor
trait `functor`[F[_]] extends ch_04.`invariant`[F]:

  def map[A, B](fa: F[A])(f: A => B): F[B]
  override def imap[A, B](fa: F[A])(forth: A => B)(back: B => A): F[B] = map(fa)(forth)

// ex. define functor for binary tree
enum Tree[+T]:

  case Leaf(value: T)
  case Branch(left: Tree[T], value: T, right: Tree[T])

object Tree:

  // smart constructors are needed to solve the covariance problem in cats
  def leaf[T](value: T): Tree[T]                                  = Leaf(value)
  def branch[T](left: Tree[T], value: T, right: Tree[T]): Tree[T] = Branch(left, value, right)

  given Functor[Tree] = new Functor[Tree]:

    override def map[A, B](tree: Tree[A])(f: A => B): Tree[B] = tree match
      case Leaf(value)                => Leaf(f(value))
      case Branch(left, value, right) => Branch(map(left)(f), f(value), map(right)(f))
~~~
