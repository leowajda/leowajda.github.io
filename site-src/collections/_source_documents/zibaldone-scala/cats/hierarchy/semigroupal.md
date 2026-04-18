---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Semigroupal.scala
tree_path: src/main/scala/hierarchy/Semigroupal.scala
source_path: cats/src/main/scala/hierarchy/Semigroupal.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Semigroupal.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Semigroupal.scala
description: Semigroupal.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait Semigroupal[F[_]]:
  def product[A, B](fa: F[A], fb: F[B]): F[(A, B)]
~~~
