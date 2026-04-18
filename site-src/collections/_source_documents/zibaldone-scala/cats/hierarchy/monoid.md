---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Monoid.scala
tree_path: src/main/scala/hierarchy/Monoid.scala
source_path: cats/src/main/scala/hierarchy/Monoid.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Monoid.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Monoid.scala
description: Monoid.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait Monoid[A] extends Semigroup[A]:
  def empty: A
~~~
