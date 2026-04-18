---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: Temporal.scala
tree_path: src/main/scala/hierarchy/Temporal.scala
source_path: cats-effect/src/main/scala/hierarchy/Temporal.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/hierarchy/Temporal.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: hierarchy
  url: ''
document_id: cats-effect:src/main/scala/hierarchy/Temporal.scala
description: Temporal.scala notes
---

~~~scala
package hierarchy

import scala.concurrent.duration.FiniteDuration

trait Temporal[F[_]] extends GenTemporal[F, Throwable]

trait GenTemporal[F[_], E] extends GenConcurrent[F, E]:
  def sleep(duration: FiniteDuration): F[Unit]
~~~
