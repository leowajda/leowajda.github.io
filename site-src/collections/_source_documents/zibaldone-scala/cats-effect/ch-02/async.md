---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: async.scala
tree_path: src/main/scala/ch_02/async.scala
source_path: cats-effect/src/main/scala/ch_02/async.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_02/async.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_02
  url: ''
document_id: cats-effect:src/main/scala/ch_02/async.scala
description: async.scala notes
---

~~~scala
package ch_02

import cats.effect.*
import utils.*
import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

val threadPool         = Executors.newFixedThreadPool(8)
given ExecutionContext = ExecutionContext.fromExecutorService(threadPool)

type CallBack[A] = Either[Throwable, A] => Unit

// async is a foreign interface which lifts async computation to an IO
// CE blocks (semantically) until 'cb' is invoked (by some other thread)
def async[A](f: () => Either[Throwable, A]): IO[A] = IO.async_ { (cb: CallBack[A]) =>
  threadPool.execute { () =>
    val result: Either[Throwable, A] = f()
    cb(result) // CE is notified of the result
  }
}

// ex. lift lambda to IO
def asyncToIO[A](f: () => A): IO[A] = IO.async_ { (cb: CallBack[A]) =>
  threadPool.execute { () =>
    val result: Either[Throwable, A] = Try(f()).toEither
    cb(result)
  }
}

// ex. lift Future to IO (a.k.a IO.fromFuture)
def asyncFuture[A](future: => Future[A]): IO[A] = IO.async_ { (cb: CallBack[A]) =>
  future.onComplete {
    case Failure(exception) => cb(Left(exception))
    case Success(value)     => cb(Right(value))
  }
}

// ex. implement a never ending IO (a.k.a IO.never)
def neverEndingIO: IO[Unit] = IO.async_ { _ => () }

// in case the async computation gets canceled, a finalizer is also needed
def asyncWithFinalizer[A](f: () => Either[Throwable, A]): IO[A] = IO.async { (cb: CallBack[A]) =>
  // finalizer in case the computation gets canceled  => IO[Unit]
  // finalizer might not be present                   => Option[IO[Unit]]
  IO {
    threadPool.execute { () =>
      val result = f()
      cb(result)
    }
  }.as(Some(IO("canceled").inspect.void)) // onCancel
}
~~~
