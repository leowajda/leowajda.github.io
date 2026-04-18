---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: Sync.scala
tree_path: src/main/scala/hierarchy/Sync.scala
source_path: cats-effect/src/main/scala/hierarchy/Sync.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/hierarchy/Sync.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: hierarchy
  url: ''
document_id: cats-effect:src/main/scala/hierarchy/Sync.scala
description: Sync.scala notes
---

~~~scala
package hierarchy

trait Sync[F[_]] extends MonadCancel[F, Throwable] with cats.Defer[F]:

  def delay[A](thunk: => A): F[A]
  def blocking[A](thunk: => A): F[A]

  override def defer[A](thunk: => F[A]): F[A] = flatMap(delay(thunk))(identity)
~~~
