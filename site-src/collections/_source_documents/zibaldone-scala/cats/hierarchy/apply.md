---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Apply.scala
tree_path: src/main/scala/hierarchy/Apply.scala
source_path: cats/src/main/scala/hierarchy/Apply.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Apply.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Apply.scala
description: Apply.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait Apply[F[_]] extends Functor[F] with Semigroupal[F]:

  def ap[A, B](ff: F[A => B])(fa: F[A]): F[B]

  override def product[A, B](fa: F[A], fb: F[B]): F[(A, B)] =
    val ff: F[A => (A, B)] = map(fb)(b => (a: A) => (a, b))
    ap(ff)(fa)
~~~
