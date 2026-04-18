---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: Concurrent.scala
tree_path: src/main/scala/hierarchy/Concurrent.scala
source_path: cats-effect/src/main/scala/hierarchy/Concurrent.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/hierarchy/Concurrent.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: hierarchy
  url: ''
document_id: cats-effect:src/main/scala/hierarchy/Concurrent.scala
description: Concurrent.scala notes
---

~~~scala
package hierarchy

import cats.effect.kernel.{Deferred, Ref}

trait Concurrent[F[_]] extends GenConcurrent[F, Throwable]

trait GenConcurrent[F[_], E] extends GenSpawn[F, E]:

  def ref[A](a: A): F[Ref[F, A]]
  def deferred[A]: F[Deferred[F, A]]
~~~
