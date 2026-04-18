---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Monad.scala
tree_path: src/main/scala/hierarchy/Monad.scala
source_path: cats/src/main/scala/hierarchy/Monad.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Monad.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Monad.scala
description: Monad.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait Monad[F[_]] extends Applicative[F] with FlatMap[F]:

  override def map[A, B](fa: F[A])(f: A => B): F[B]         = flatMap(fa)(a => pure(f(a)))
  override def product[A, B](fa: F[A], fb: F[B]): F[(A, B)] = flatMap(fa)(a => map(fb)(b => (a, b)))
~~~
