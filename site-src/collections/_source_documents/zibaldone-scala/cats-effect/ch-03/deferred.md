---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: deferred.scala
tree_path: src/main/scala/ch_03/deferred.scala
source_path: cats-effect/src/main/scala/ch_03/deferred.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_03/deferred.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_03
  url: ''
document_id: cats-effect:src/main/scala/ch_03/deferred.scala
description: deferred.scala notes
---

~~~scala
package ch_03

import utils.*
import cats.effect.*
import scala.concurrent.duration.*

def producerConsumer[A](value: A): IO[Unit] =

  def consumer(signal: Deferred[IO, A]): IO[Unit] =
    for
      _      <- IO.pure("[consumer] - waiting for result").inspect
      result <- signal.get
      _      <- IO.pure(s"[consumer] - result: $result").inspect
    yield ()

  def producer(signal: Deferred[IO, A]): IO[Unit] =
    for
      _ <- IO.pure(s"[producer] - producing result").inspect
      _ <- signal.complete(value).delayBy(5.seconds)
    yield ()

  for
    signal      <- IO.deferred[A]
    consumerFib <- consumer(signal).start
    producerFib <- producer(signal).start
    _           <- consumerFib.join
    _           <- producerFib.join
  yield ()

// ex. rewrite with deferred
def refFileNotifier(fileParts: List[String]): IO[Unit] =

  def downloadFile(ref: Ref[IO, String]): IO[Unit] =
    fileParts
      .map { part => ref.update(_ + part).delayBy(1.second) }
      .sequence
      .void

  // busy waiting
  def notifyFileComplete(ref: Ref[IO, String]): IO[Unit] =
    for
      content <- ref.get
      _       <- if content.endsWith("<EOF>") then IO.unit else notifyFileComplete(ref).delayBy(500.millis)
    yield ()

  for
    ref         <- IO.ref("")
    fibDownload <- downloadFile(ref).start
    fibNotifier <- notifyFileComplete(ref).start
    _           <- fibDownload.join
    _           <- fibNotifier.join
    _           <- ref.get.map(content => s"Final content: $content")
  yield ()

def deferredFileNotifier(fileParts: List[String]): IO[Unit] =

  def downloadFile(part: String, ref: Ref[IO, String], signal: Deferred[IO, String]): IO[Unit] =
    for
      _       <- IO.pure(s"part: $part").inspect
      content <- ref.updateAndGet(_ + part).delayBy(500.millis)
      _       <- if content.endsWith("<EOF>") then signal.complete(content) else IO.unit
    yield ()

  def notifyFileComplete(signal: Deferred[IO, String]): IO[Unit] =
    for
      content <- signal.get
      -       <- IO.pure(s"Final content: $content").inspect
    yield ()

  for
    signal      <- IO.deferred[String]
    ref         <- IO.ref("")
    fibDownload <- fileParts.map(downloadFile(_, ref, signal)).sequence.start
    fibNotifier <- notifyFileComplete(signal).start
    _           <- fibDownload.join
    _           <- fibNotifier.join
  yield ()

// ex. implement timer with Deferred
def timer(duration: FiniteDuration): IO[Unit] =

  def incrementTimer(timer: Ref[IO, Int], signal: Deferred[IO, Boolean]): IO[Unit] =
    for
      time <- timer.updateAndGet(_ + 1).delayBy(1.second)
      _    <- if time >= duration.toSeconds then signal.complete(true) else incrementTimer(timer, signal)
    yield ()

  def notify(signal: Deferred[IO, Boolean]): IO[Unit] = signal.get.as("Time's up").inspect.void

  for
    signal      <- IO.deferred[Boolean]
    ref         <- IO.ref(0)
    fibTimer    <- incrementTimer(ref, signal).start
    fibNotifier <- notify(signal).start
    _           <- fibTimer.join
    _           <- fibNotifier.join
  yield ()

// ex. implement race in terms of Deferred
def racePair[A, B](ioa: IO[A], iob: IO[B]): IO[Either[(OutcomeIO[A], FiberIO[B]), (FiberIO[A], OutcomeIO[B])]] =
  type EitherOutcome = Either[OutcomeIO[A], OutcomeIO[B]]

  IO.uncancelable { poll =>
    for
      signal <- IO.deferred[EitherOutcome]
      fibA   <- ioa.guaranteeCase(outcomeA => signal.complete(Left(outcomeA)).void).start
      fibB   <- iob.guaranteeCase(outcomeB => signal.complete(Right(outcomeB)).void).start
      res    <- poll(signal.get).onCancel {
                  for
                    cancelFibA <- fibA.cancel.start
                    cancelFibB <- fibB.cancel.start
                    _          <- cancelFibA.join
                    _          <- cancelFibB.join
                  yield ()
                }
    yield res match
      case Left(outcomeA)  => Left((outcomeA, fibB))
      case Right(outcomeB) => Right((fibA, outcomeB))
  }
~~~
