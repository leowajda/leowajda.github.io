---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: FlatMap.scala
tree_path: src/main/scala/hierarchy/FlatMap.scala
source_path: cats/src/main/scala/hierarchy/FlatMap.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/FlatMap.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/FlatMap.scala
description: FlatMap.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait FlatMap[F[_]] extends Apply[F]:

  def flatMap[A, B](fa: F[A])(f: A => F[B]): F[B]
  override def ap[A, B](ff: F[A => B])(fa: F[A]): F[B] = flatMap(ff)(f => map(fa)(f(_)))
~~~
