---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: contravariant.scala
tree_path: src/main/scala/ch_04/contravariant.scala
source_path: cats/src/main/scala/ch_04/contravariant.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_04/contravariant.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_04
  url: ''
document_id: cats:src/main/scala/ch_04/contravariant.scala
description: contravariant.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_04

// contravariant type class
trait Format[T]:

  def format(value: T): String

  // functor applies transformations in order
  // contramap applies transformation in reverse order
  def contramap[A](f: A => T): Format[A] = (a: A) => format(f(a))

trait `contravariant`[F[_]] extends ch_04.`invariant`[F]:

  def contramap[A, B](fa: F[A])(f: B => A): F[B]
  override def imap[A, B](fa: F[A])(forth: A => B)(back: B => A): F[B] = contramap(fa)(back)
~~~
