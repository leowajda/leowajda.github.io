---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: monadError.scala
tree_path: src/main/scala/ch_03/monadError.scala
source_path: cats/src/main/scala/ch_03/monadError.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_03/monadError.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_03
  url: ''
document_id: cats:src/main/scala/ch_03/monadError.scala
description: monadError.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_03

// MonadError[Try, Throwable]
trait `monadError`[F[_], E] extends ch_03.`applicativeError`[F, E] with ch_01.`monad`[F]:
  def ensure[A](fa: F[A])(e: E)(f: E => Boolean): F[A]
~~~
