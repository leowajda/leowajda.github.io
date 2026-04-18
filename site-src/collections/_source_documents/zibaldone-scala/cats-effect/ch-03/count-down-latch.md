---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: countDownLatch.scala
tree_path: src/main/scala/ch_03/countDownLatch.scala
source_path: cats-effect/src/main/scala/ch_03/countDownLatch.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_03/countDownLatch.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_03
  url: ''
document_id: cats-effect:src/main/scala/ch_03/countDownLatch.scala
description: countDownLatch.scala notes
---

~~~scala
package ch_03

import cats.effect.*
import cats.effect.std.CountDownLatch
import utils.*
import cats.syntax.parallel.*
import cats.syntax.traverse.*

import java.io.FileWriter
import scala.concurrent.duration.*
import scala.io.Source

def race(counter: Int): IO[Unit] =
  def notifier(latch: CountDownLatch[IO], counter: Int): IO[Unit] =
    (1 to counter + 1)
      .toList
      .map(IO.pure)
      .reduce { _.inspect >> IO.sleep(1.second) >> latch.release >> _ }
      .void

  def runner(id: Int, latch: CountDownLatch[IO]): IO[Unit] =
    for
      _ <- IO.pure(s"[runner-$id] - waiting for notification...").inspect
      _ <- latch.await
      _ <- IO.pure(s"[runner-$id] - executing").inspect
    yield ()

  for
    latch       <- CountDownLatch[IO](counter)
    notifierFib <- notifier(latch, counter).start
    _           <- (1 to counter).toList.parTraverse(runner(_, latch))
    _           <- notifierFib.join
  yield ()

// ex. multithreaded file downloader
trait FileServer:

  def numChunks: IO[Int]
  def chunk(at: Int): IO[String]

object FileServer:

  private def writeToFile(path: String, content: String): IO[Unit] =
    val file = Resource.make(IO(FileWriter(path)))(writer => IO(writer.close()))
    file.use { writer => IO(writer.write(content)) }

  private def copyToFile(fromFile: String, toFile: String): IO[Unit] =
    val resources =
      for
        reader <- Resource.make(IO(Source.fromFile(fromFile)))(source => IO(source.close()))
        writer <- Resource.make(IO(FileWriter(toFile, true)))(writer => IO(writer.close()))
      yield (reader, writer)

    resources.use { (reader, writer) => IO(reader.getLines().foreach(writer.write)) }

  private def downloadChunk(
    id: Int,
    fileServer: FileServer,
    latch: CountDownLatch[IO],
    fileName: String,
    destFolder: String
  ): IO[Unit] =
    for
      _     <- IO.pure(s"[chunk-$id] - downloading...").inspect
      chunk <- fileServer.chunk(id).delayBy(1.second)
      _     <- IO.pure(s"[chunk-$id] - writing to disk").inspect
      _     <- writeToFile(s"$destFolder/$fileName.part$id", chunk)
      _     <- latch.release
      _     <- IO.pure(s"[chunk-$id] - latch released").inspect
    yield ()

  def downloadFile(fileServer: FileServer, fileName: String, folder: String): IO[Unit] =
    for
      nChunks <- fileServer.numChunks
      latch   <- CountDownLatch[IO](nChunks)
      _       <- (0 until nChunks).toList.parTraverse(downloadChunk(_, fileServer, latch, fileName, folder))
      _       <- latch.await
      _       <- (0 until nChunks).toList.traverse(id => copyToFile(s"$folder/$fileName.part$id", s"$folder/$fileName"))
    yield ()

// ex. implement CountDownLatch
abstract class CountDownLatchIO:

  def await: IO[Unit]
  def release: IO[Unit]

object CountDownLatchIO:

  private[CountDownLatchIO] enum State:

    case Done         extends State
    case Live(n: Int) extends State

  private[CountDownLatchIO] object State:
    def live(n: Int): State = Live(n)

  def apply(n: Int): IO[CountDownLatchIO] =
    for
      signal <- IO.deferred[Unit]
      state  <- IO.ref(State.live(n))
    yield new CountDownLatchIO:

      override def await: IO[Unit] = state.get.flatMap {
        case State.Done => IO.unit
        case _          => signal.get
      }

      override def release: IO[Unit] = state.modify {
        case State.Done    => State.Done        -> IO.unit
        case State.Live(1) => State.Done        -> signal.complete(()).void
        case State.Live(n) => State.Live(n - 1) -> IO.unit
      }.flatten
~~~
