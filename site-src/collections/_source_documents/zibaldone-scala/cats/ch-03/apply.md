---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: apply.scala
tree_path: src/main/scala/ch_03/apply.scala
source_path: cats/src/main/scala/ch_03/apply.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_03/apply.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_03
  url: ''
document_id: cats:src/main/scala/ch_03/apply.scala
description: apply.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_03

trait `apply`[F[_]] extends ch_01.`functor`[F] with ch_03.`semigroupal`[F]:

  def ap[A, B](ff: F[A => B])(fa: F[A]): F[B]
  
  override def product[A, B](fa: F[A], fb: F[B]): F[(A, B)] =
    val ff: F[A => (A, B)] = map(fb)(b => (a: A) => (a, b))
    ap(ff)(fa)

  // ex. implement mapN
  def mapN[A, B, C](fa: F[A], fb: F[B])(f: (A, B) => C): F[C] = map(product(fa, fb))(f(_, _))
~~~
