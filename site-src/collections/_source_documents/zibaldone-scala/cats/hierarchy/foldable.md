---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Foldable.scala
tree_path: src/main/scala/hierarchy/Foldable.scala
source_path: cats/src/main/scala/hierarchy/Foldable.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Foldable.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Foldable.scala
description: Foldable.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

import cats.Eval

trait Foldable[F[_]]:

  def foldLeft[A, B](fa: F[A], b: B)(f: (B, A) => B): B
  def foldRight[A, B](fa: F[A], b: Eval[B])(f: (A, Eval[B]) => Eval[B]): Eval[B]
~~~
