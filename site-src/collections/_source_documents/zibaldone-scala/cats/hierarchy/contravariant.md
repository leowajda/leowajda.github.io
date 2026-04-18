---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Contravariant.scala
tree_path: src/main/scala/hierarchy/Contravariant.scala
source_path: cats/src/main/scala/hierarchy/Contravariant.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Contravariant.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Contravariant.scala
description: Contravariant.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait Contravariant[F[_]] extends Invariant[F]:

  def contramap[A, B](fa: F[A])(f: B => A): F[B]
  override def imap[A, B](fa: F[A])(forth: A => B)(back: B => A): F[B] = contramap(fa)(back)
~~~
