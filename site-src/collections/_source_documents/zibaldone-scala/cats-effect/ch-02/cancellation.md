---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: cancellation.scala
tree_path: src/main/scala/ch_02/cancellation.scala
source_path: cats-effect/src/main/scala/ch_02/cancellation.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_02/cancellation.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_02
  url: ''
document_id: cats-effect:src/main/scala/ch_02/cancellation.scala
description: cancellation.scala notes
---

~~~scala
package ch_02

import cats.effect.*
import utils.*
import scala.concurrent.duration.*
import scala.io.StdIn

// unrestricted cancellation may lead to inconsistent state
def faultyPaymentSystem[A](core: IO[A]): IO[Unit] =
  for
    fib <- core.delayBy(1.second).onCancel(IO.pure("shouldn't be possible").void).start
    _   <- IO.sleep(500.millis) >> fib.cancel
    _   <- fib.join
  yield ()

// Poll[F] => F[_] marks sections within the returned effect which can be canceled
def uncancelledPaymentSystem[A](core: IO[A]): IO[Unit] =
  for
    fib <- core.delayBy(1.second).uncancelable.start
    _   <- IO.sleep(500.millis) >> fib.cancel
    _   <- fib.join
  yield ()

def inputPassword: IO[String]          = IO(StdIn.readLine()).delayBy(2.seconds)
def hashPassword(pwd: String): IO[Int] = IO.pure(pwd).delayBy(2.seconds).map(util.hashing.MurmurHash3.stringHash)

def authFlow(dbHash: IO[Int]): IO[Boolean] = IO.uncancelable { (poll: Poll[IO]) =>
  for
    pwd    <- poll(inputPassword).onCancel(IO("inputPassword canceled").void)
    hash   <- hashPassword(pwd)     // no longer cancelable
    isSame <- dbHash.map(_ == hash) // no longer cancelable
  yield isSame
}

// IO.canceled is ignored because it's not explicitly marked by Poll[F] (think in terms of the call-stack)
def overrideCancellation: IO[Unit] = IO.uncancelable(_ => IO.canceled >> IO.unit)

// the outer Poll[F] mask overrides the inner Poll[F] mask so the authFlow effect is entirely uncancelable
def overrideAuthFlowCancellation(dbHash: IO[Int]): IO[OutcomeIO[Boolean]] =
  for
    authFib <- IO.uncancelable(_ => authFlow(dbHash)).start // while IO.uncancelable(poll => poll(authFlow)) == authFlow
    _       <- IO.sleep(1.second) >> authFib.cancel
    res     <- authFib.join
  yield res

def cancellationSignals: IO[Unit] =
  val program = IO.uncancelable { poll =>
    poll(IO.pure("first cancelable region").inspect >> IO.sleep(1.second)) >>
      IO.pure("uncancelable region").inspect >> IO.sleep(1.second) >>
      poll(IO.pure("second cancelable region").inspect >> IO.sleep(1.second))
  }

  program.onCancel(IO.pure("successful cancellation").inspect.void)
  // [0 - 1000]    - cancellation signal is received within the first cancelable region, 'program' gets canceled
  // [1000 - 2000] - cancellation signal is received within an uncancelable region, 'program' continues to execute until
  //                 it enters the second cancelable region where it gets canceled
  // [2000 - 3000] - cancellation signal is received within the second cancelable region, 'program' gets canceled
  for
    fib <- program.start
    _   <- IO.pure("cancellation attempt").inspect.delayBy(1500.millis) >> fib.cancel
    _   <- fib.join
  yield ()
~~~
