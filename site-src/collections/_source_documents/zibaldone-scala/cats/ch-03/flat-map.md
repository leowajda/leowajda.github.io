---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: flatMap.scala
tree_path: src/main/scala/ch_03/flatMap.scala
source_path: cats/src/main/scala/ch_03/flatMap.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_03/flatMap.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_03
  url: ''
document_id: cats:src/main/scala/ch_03/flatMap.scala
description: flatMap.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_03

trait `flatMap`[F[_]] extends `apply`[F]:

  def flatMap[A, B](fa: F[A])(f: A => F[B]): F[B]
  final override def ap[A, B](ff: F[A => B])(fa: F[A]): F[B] = flatMap(ff)(f => map(fa)(f(_)))
~~~
