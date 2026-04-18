---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: brackets.scala
tree_path: src/main/scala/ch_02/brackets.scala
source_path: cats-effect/src/main/scala/ch_02/brackets.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_02/brackets.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_02
  url: ''
document_id: cats-effect:src/main/scala/ch_02/brackets.scala
description: brackets.scala notes
---

~~~scala
package ch_02

import cats.effect.*

import java.io.{File, FileReader}
import java.util.Scanner
import scala.concurrent.duration.*
import utils.*

final case class Connection(url: String):

  def open: IO[Unit]  = IO(s"opening connection: $url").inspect.void
  def close: IO[Unit] = IO(s"closing connection: $url").inspect.void

object brackets:

  // cancellation is not aware of the resource leakage, connection.close is never invoked
  def leakyConnection: IO[Unit] =
    for
      fib <- (Connection("wikipedia.org").open *> IO.sleep(5.seconds)).start
      _   <- IO.sleep(1.second) *> fib.cancel
    yield ()

  // manually registering a callback is prone to error and lacks composition
  def safeConnection: IO[Unit] =
    for
      conn <- IO.pure(Connection("wikipedia.org"))
      fib  <- (conn.open *> IO.sleep(5.seconds)).onCancel(conn.close).start
      _    <- IO.sleep(1.second) *> fib.cancel
    yield ()

  // resource gets released upon error or cancellation
  def bracketConnection: IO[Unit] =
    for
      fib <- IO.pure(Connection("wikipedia.org")).bracket(_.open *> IO.sleep(5.seconds))(_.close).start
      _   <- IO.sleep(1.second) *> fib.cancel
    yield ()

  // ex. read file line by line every 100 millis
  def fileScanner(path: String): IO[Scanner] = IO(new Scanner(new FileReader(new File(path))))

  def scannerReader(scanner: Scanner): IO[Unit] =
    if scanner.hasNextLine then IO.println(scanner.nextLine()) >> IO.sleep(100.millis) >> scannerReader(scanner)
    else IO.unit

  def fileReader(path: String): IO[Unit] = fileScanner(path).bracket(scannerReader)(scanner => IO(scanner.close()))

  // ex. create a connection from a configuration file
  // bracket composition is no different from imperative try-catch statements
  def connectionFromConfig(path: String): IO[Unit] = fileScanner(path).bracket { scanner =>
    IO(Connection(scanner.nextLine())).bracket { _.open *> IO.sleep(5.seconds) } { _.close }
  } { scanner => IO(scanner.close()) }
~~~
