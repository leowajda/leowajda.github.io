---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: Async.scala
tree_path: src/main/scala/hierarchy/Async.scala
source_path: cats-effect/src/main/scala/hierarchy/Async.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/hierarchy/Async.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: hierarchy
  url: ''
document_id: cats-effect:src/main/scala/hierarchy/Async.scala
description: Async.scala notes
---

~~~scala
package hierarchy

import scala.concurrent.ExecutionContext

trait Async[F[_]] extends Sync[F] with Temporal[F]:

  def executionContext: F[ExecutionContext]
  def evalOn[A](fa: F[A], ec: ExecutionContext): F[A]
  def async[A](cb: (Either[Throwable, A] => Unit) => F[Option[F[Unit]]]): F[A]

  def async_[A](cb: (Either[Throwable, A] => Unit) => Unit): F[A] = async(kb => map(pure(cb(kb)))(_ => None))
  override def never[A]: F[A]                                     = async(_ => pure(Some(unit)))
~~~
