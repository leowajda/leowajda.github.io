---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: Semigroup.scala
tree_path: src/main/scala/hierarchy/Semigroup.scala
source_path: cats/src/main/scala/hierarchy/Semigroup.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/hierarchy/Semigroup.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: hierarchy
  url: ''
document_id: cats:src/main/scala/hierarchy/Semigroup.scala
description: Semigroup.scala notes
---

~~~scala
package com.zibaldone.cats
package hierarchy

trait Semigroup[A]:
  def combine(x: A, y: A): A
~~~
