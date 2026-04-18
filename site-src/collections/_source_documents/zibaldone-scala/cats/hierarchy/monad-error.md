---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: MonadError.scala
tree_path: src/main/scala/hierarchy/MonadError.scala
source_path: cats/src/main/scala/hierarchy/MonadError.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/MonadError.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/MonadError.scala
description: MonadError.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait MonadError[F[_], E] extends ApplicativeError[F, E] with Monad[F]:
  def ensure[A](fa: F[A])(e: => E)(f: E => Boolean): F[A]
~~~
