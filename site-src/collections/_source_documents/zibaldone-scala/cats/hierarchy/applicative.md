---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Applicative.scala
tree_path: src/main/scala/hierarchy/Applicative.scala
source_path: cats/src/main/scala/hierarchy/Applicative.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Applicative.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Applicative.scala
description: Applicative.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait Applicative[F[_]] extends Apply[F]:
  def pure[A](a: A): F[A]
~~~
