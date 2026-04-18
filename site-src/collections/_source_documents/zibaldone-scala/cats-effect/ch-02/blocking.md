---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: blocking.scala
tree_path: src/main/scala/ch_02/blocking.scala
source_path: cats-effect/src/main/scala/ch_02/blocking.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_02/blocking.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_02
  url: ''
document_id: cats-effect:src/main/scala/ch_02/blocking.scala
description: blocking.scala notes
---

~~~scala
package ch_02

import cats.effect.*

import java.util.concurrent.Executors
import scala.concurrent.ExecutionContext
import scala.concurrent.duration.FiniteDuration

def semanticBlocking(duration: FiniteDuration): IO[Unit] = IO.sleep(duration)

// NOT semantic blocking - shifts computation to a blocking thread pool
def actualBlocking(duration: FiniteDuration): IO[Unit] = IO.blocking(Thread.sleep(duration.toMillis))

val ec: ExecutionContext = ExecutionContext.fromExecutorService(Executors.newFixedThreadPool(8))

// IO.cede is a fairness boundary that yields control back to the scheduler of the runtime system
// only needed for CPU bound applications
def cpuBoundCompute(hugeRange: Range): IO[Int] = hugeRange.map(IO.pure).reduce(_ >> IO.cede >> _).evalOn(ec)
~~~
