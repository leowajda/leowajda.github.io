---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: mutex.scala
tree_path: src/main/scala/ch_03/mutex.scala
source_path: cats-effect/src/main/scala/ch_03/mutex.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_03/mutex.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_03
  url: ''
document_id: cats-effect:src/main/scala/ch_03/mutex.scala
description: mutex.scala notes
---

~~~scala
package ch_03

import utils.*
import cats.effect.*
import cats.syntax.parallel.*

import scala.collection.immutable.Queue
import scala.concurrent.duration.*
import scala.util.Random

abstract class MutexIO:

  def acquire: IO[Unit]
  def release: IO[Unit]

object MutexIO:

  private[MutexIO] type Signal = Deferred[IO, Unit]
  private[MutexIO] final case class State(isLocked: Boolean, queue: Queue[Signal])
  private[MutexIO] val unlocked: State = State(false, Queue.empty)

  def apply(): IO[MutexIO] = IO.ref(unlocked).map { state =>
    new MutexIO:

      override def acquire: IO[Unit] = IO.uncancelable { poll =>
        IO.deferred[Unit].flatMap { signal =>

          val cleanup: IO[Unit] = state.modify {
            case State(isLocked, queue) =>
              val newQueue  = queue.filterNot(_ eq signal)
              val isRunning = newQueue.size == queue.size
              State(isLocked, queue) -> (if isRunning then release else IO.unit)
          }.flatten

          state.modify {
            case State(false, _)    => State(true, Queue.empty)           -> IO.unit
            case State(true, queue) => State(true, queue.enqueue(signal)) -> poll(signal.get).onCancel(cleanup)
          }.flatten
        }
      }

      override def release: IO[Unit] = state.modify {
        case State(false, _)                     => unlocked -> IO.unit
        case State(true, queue) if queue.isEmpty => unlocked -> IO.unit
        case State(true, queue)                  =>
          val (signal, rest) = queue.dequeue
          State(true, rest) -> signal.complete(()).void
      }.flatten

  }

def criticalTask: IO[Int] = IO.sleep(5.seconds) >> IO(Random.nextInt(100))

def lockingTask(id: Int, mutex: MutexIO): IO[Int] =
  for
    _   <- IO.pure(s"[task-$id] - acquiring lock").inspect
    _   <- mutex.acquire
    _   <- IO.pure(s"[task-$id] - critical section").inspect
    res <- criticalTask
    _   <- IO.pure(s"[task-$id] - releasing mutex").inspect
    _   <- mutex.release
    _   <- IO.pure(s"[task-$id] - lock removed").inspect
  yield res

def lockingTasks: IO[Int] =
  for
    mutex <- MutexIO()
    res   <- (1 to 10).toList.parTraverse(lockingTask(_, mutex))
  yield res.sum
~~~
