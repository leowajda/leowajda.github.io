---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: traverse.scala
tree_path: src/main/scala/ch_03/traverse.scala
source_path: cats/src/main/scala/ch_03/traverse.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_03/traverse.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_03
  url: ''
document_id: cats:src/main/scala/ch_03/traverse.scala
description: traverse.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_03

import cats.{Applicative, Monad}
import cats.syntax.flatMap.*
import cats.syntax.functor.*
import cats.syntax.applicative.*
import cats.syntax.apply.*

// ex. list traverse
def monadListTraverse[F[_]: Monad as monad, A, B](fa: List[A])(f: A => F[B]): F[List[B]]    =
  val pureF: F[List[B]] = List.empty[B].pure[F]
  fa.foldLeft(pureF) { (listF, a) =>
    for
      list <- listF
      fb   <- f(a)
    yield list :+ fb
  }

// when F[_] == Vector[_] the lists are combinations because map is implemented in terms of flatMap
// behaves differently for cats.data.Validated
def applicativeListTraverse[F[_]: Applicative, A, B](fa: List[A])(f: A => F[B]): F[List[B]] =
  val pureF: F[List[B]] = List.empty[B].pure[F]
  fa.foldLeft(pureF) { (listF, a) => (listF, f(a)).mapN(_ :+ _) }

// ex. implement sequence
def listSequence[F[_]: Applicative as applicative, A](fa: List[F[A]]): F[List[A]]           =
  applicativeListTraverse(fa)(identity)

trait `traverse`[F[_]] extends `foldable`[F] with ch_01.`functor`[F]:

  def traverse[M[_]: Applicative, A, B](fa: F[A])(f: A => M[B]): M[F[B]]
  def sequence[M[_]: Applicative, A](fa: F[M[A]]): M[F[A]] = traverse(fa)(identity)

  // ex. implement map
  type Identity[A] = A // <-- BiMonad
  def map[A, B](fa: F[A])(f: A => B): F[B] = traverse[Identity, A, B](fa)(f(_))
~~~
