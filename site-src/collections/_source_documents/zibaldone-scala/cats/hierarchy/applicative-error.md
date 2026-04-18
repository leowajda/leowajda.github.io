---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: ApplicativeError.scala
tree_path: src/main/scala/hierarchy/ApplicativeError.scala
source_path: cats/src/main/scala/hierarchy/ApplicativeError.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/ApplicativeError.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/ApplicativeError.scala
description: ApplicativeError.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait ApplicativeError[F[_], E] extends Applicative[F]:

  def raiseError[A](e: E): F[A]
  def handleErrorWith[A](fa: F[A])(f: E => F[A]): F[A]
  def handleError[A](fa: F[A])(f: E => A): F[A] = handleErrorWith(fa)(e => pure(f(e)))
~~~
