---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: fibers.scala
tree_path: src/main/scala/ch_02/fibers.scala
source_path: cats-effect/src/main/scala/ch_02/fibers.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_02/fibers.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_02
  url: ''
document_id: cats-effect:src/main/scala/ch_02/fibers.scala
description: fibers.scala notes
---

~~~scala
package ch_02

import scala.concurrent.duration.*
import cats.effect.*
import cats.effect.kernel.Outcome.*
import utils.*

// Succeeded(io)
def outcomeSucceeded: IO[Outcome[IO, Throwable, Unit]] =
  for
    fib <- IO.unit.start
    res <- fib.join
  yield res

// Errored(e)
def outcomeFailed: IO[Outcome[IO, Throwable, Unit]] =
  for
    fib <- IO.raiseError[Unit](new RuntimeException).start
    res <- fib.join
  yield res

// Canceled()
def outcomeCanceled: IO[Outcome[IO, Throwable, Unit]] =
  for
    fib <- IO.sleep(5.seconds).onCancel(IO("cancelling ... ").inspect.void).start
    _   <- IO.sleep(1.second) >> fib.cancel
    res <- fib.join
  yield res

// ex. run IO on separate fiber and recover from cancellation or error
def processResultFromFiber[A](io: IO[A]): IO[A] =
  for
    fib <- io.start
    out <- fib.join
    res <- fallback(out)
  yield res

def fallback[A](outcome: OutcomeIO[A]): IO[A] =
  outcome match
    case Succeeded(fa) => fa
    case Errored(e)    => IO.raiseError[A](e)
    case Canceled()    => IO.raiseError[A](new RuntimeException("canceled"))

// ex. take two IOs, run on different fibers and tuple their return values
def tupleIOs[A, B](ioa: IO[A], iob: IO[B]): IO[(A, B)] =
  def tuple(a: OutcomeIO[A], b: OutcomeIO[B]): IO[(A, B)] = (a, b) match
    case (Succeeded(fa), Succeeded(fb)) => fa.flatMap(a => fb.map(b => (a, b)))
    case (Errored(e), _)                => IO.raiseError(e)
    case (_, Errored(e))                => IO.raiseError(e)
    case _                              => IO.raiseError(new RuntimeException("canceled"))

  for
    aFib <- ioa.start
    bFib <- iob.start
    aOut <- aFib.join
    bOut <- bFib.join
    res  <- tuple(aOut, bOut)
  yield res

// ex. implement timeout
def timeout[A](io: IO[A], duration: FiniteDuration): IO[A] =
  for
    fib <- io.start
    _   <- IO.sleep(duration) >> fib.cancel
    out <- fib.join
    res <- fallback(out)
  yield res
~~~
