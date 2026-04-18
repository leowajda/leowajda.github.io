---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Functor.scala
tree_path: src/main/scala/hierarchy/Functor.scala
source_path: cats/src/main/scala/hierarchy/Functor.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Functor.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Functor.scala
description: Functor.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait Functor[F[_]] extends Invariant[F]:

  def map[A, B](fa: F[A])(f: A => B): F[B]
  override def imap[A, B](fa: F[A])(forth: A => B)(back: B => A): F[B] = map(fa)(forth)
~~~
