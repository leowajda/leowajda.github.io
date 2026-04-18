---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: ref.scala
tree_path: src/main/scala/ch_03/ref.scala
source_path: cats-effect/src/main/scala/ch_03/ref.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_03/ref.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_03
  url: ''
document_id: cats-effect:src/main/scala/ch_03/ref.scala
description: ref.scala notes
---

~~~scala
package ch_03

import scala.concurrent.duration.*
import cats.syntax.parallel.*
import cats.effect.*
import utils.*

def unsafeCounter(words: List[String]): IO[Unit] =
  var total = 0

  def task(word: String): IO[Unit] =
    val wordCount = word.split(" ").length
    for
      _ <- IO(s"$word -> $wordCount").inspect
      _ <- IO(total += wordCount)
      _ <- IO(s"current total: $total").inspect
    yield ()

  words.map(task).parSequence.void

def safeCounter(words: List[String]): IO[Unit] =

  def task(word: String, total: Ref[IO, Int]): IO[Unit] =
    val wordCount = word.split(" ").length
    for
      _        <- IO(s"$word -> $wordCount").inspect
      newTotal <- total.updateAndGet(_ + wordCount)
      _        <- IO(s"current total: $newTotal").inspect
    yield ()

  for
    ref <- IO.ref(0)
    _   <- words.map(task(_, ref)).parSequence
  yield ()

// ex. refactor to IO.ref
def unsafeTickingClock(interval: FiniteDuration): IO[Unit] =
  var ticks = 0L

  def tickClock: IO[Unit] =
    for
      _ <- IO.sleep(1.second)
      _ <- IO(ticks += 1)
      _ <- tickClock
    yield ()

  def showTickingClock(interval: FiniteDuration): IO[Unit] =
    for
      _ <- IO.sleep(interval)
      _ <- IO(s"ticks: $ticks").inspect
      _ <- showTickingClock(interval)
    yield ()

  (tickClock, showTickingClock(interval)).parTupled.void

def safeTickingClock(interval: FiniteDuration): IO[Unit] =

  def tickClock(ref: Ref[IO, Long]): IO[Unit] =
    for
      _ <- IO.sleep(1.second)
      _ <- ref.update(_ + 1)
      _ <- tickClock(ref)
    yield ()

  def showTickingClock(interval: FiniteDuration, ref: Ref[IO, Long]): IO[Unit] =
    for
      _ <- IO.sleep(interval)
      _ <- ref.get.map(ticks => s"ticks: $ticks").inspect
      _ <- showTickingClock(interval, ref)
    yield ()

  for
    ref                 <- IO.ref(0L)
    fibTickClock        <- tickClock(ref).start
    fibShowTickingClock <- showTickingClock(interval, ref).start
    _                   <- fibTickClock.join
    _                   <- fibShowTickingClock.join
  yield ()
~~~
