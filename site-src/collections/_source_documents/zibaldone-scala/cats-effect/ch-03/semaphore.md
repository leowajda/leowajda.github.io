---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: semaphore.scala
tree_path: src/main/scala/ch_03/semaphore.scala
source_path: cats-effect/src/main/scala/ch_03/semaphore.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_03/semaphore.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_03
  url: ''
document_id: cats-effect:src/main/scala/ch_03/semaphore.scala
description: semaphore.scala notes
---

~~~scala
package ch_03

import cats.effect.*
import cats.effect.std.Semaphore
import utils.*

import cats.syntax.parallel.*
import scala.concurrent.duration.*

val serverLogic: IO[Unit] = IO.sleep(2.seconds)

def serverLogic(id: Int, sem: Semaphore[IO]): IO[Unit] =
  for
    _ <- IO.pure(s"[session-$id] - waiting to run..").inspect
    _ <- sem.acquire
    _ <- IO.pure(s"[session-$id] - logged in").inspect
    _ <- serverLogic
    _ <- sem.release
    _ <- IO.pure(s"[session-$id] - logged out").inspect
  yield ()

def cappedServer(capSize: Int = 1 /* mutex */, numSessions: Int): IO[Unit] =
  for
    sem <- Semaphore[IO](capSize)
    _   <- (1 to numSessions).toList.parTraverse(serverLogic(_, sem))
  yield ()
~~~
