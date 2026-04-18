---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: MonadCancel.scala
tree_path: src/main/scala/hierarchy/MonadCancel.scala
source_path: cats-effect/src/main/scala/hierarchy/MonadCancel.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/hierarchy/MonadCancel.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: hierarchy
  url: ''
document_id: cats-effect:src/main/scala/hierarchy/MonadCancel.scala
description: MonadCancel.scala notes
---

~~~scala
package hierarchy

// onCancel, guarantee, guaranteeCase, bracket
trait MonadCancel[F[_], E] extends cats.MonadError[F, E]:

  def canceled: F[Unit]
  def uncancelable[A](poll: Poll[F] => F[A]): F[A]

trait Poll[F[_]]:
  def apply[A](fa: F[A]): F[A]
~~~
