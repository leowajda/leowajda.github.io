---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: Spawn.scala
tree_path: src/main/scala/hierarchy/Spawn.scala
source_path: cats-effect/src/main/scala/hierarchy/Spawn.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/hierarchy/Spawn.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: hierarchy
  url: ''
document_id: cats-effect:src/main/scala/hierarchy/Spawn.scala
description: Spawn.scala notes
---

~~~scala
package hierarchy

import cats.effect.kernel.Fiber

trait Spawn[F[_]] extends GenSpawn[F, Throwable]

trait GenSpawn[F[_], E] extends MonadCancel[F, E]:

  def start[A](fa: F[A]): F[Fiber[F, E, A]]
  def never[A]: F[A]
  def cede: F[Unit]
~~~
