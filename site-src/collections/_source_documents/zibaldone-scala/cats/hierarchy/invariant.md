---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Invariant.scala
tree_path: src/main/scala/hierarchy/Invariant.scala
source_path: cats/src/main/scala/hierarchy/Invariant.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Invariant.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Invariant.scala
description: Invariant.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait Invariant[F[_]]:
  def imap[A, B](fa: F[A])(forth: A => B)(back: B => A): F[B]
~~~
