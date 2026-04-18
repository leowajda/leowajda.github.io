---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: applicativeError.scala
tree_path: src/main/scala/ch_03/applicativeError.scala
source_path: cats/src/main/scala/ch_03/applicativeError.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_03/applicativeError.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_03
  url: ''
document_id: cats:src/main/scala/ch_03/applicativeError.scala
description: applicativeError.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_03

trait `applicativeError`[F[_], E] extends ch_03.`applicative`[F]:

  def raiseError[A](e: E): F[A]
  def handleErrorWith[A](fa: F[A])(f: E => F[A]): F[A]
  def handleError[A](fa: F[A])(f: E => A): F[A] = handleErrorWith(fa)(e => pure(f(e)))
~~~
