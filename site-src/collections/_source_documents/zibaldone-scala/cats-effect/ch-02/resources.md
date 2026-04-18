---
project_slug: zibaldone-scala
module_slug: cats-effect
module_title: Cats Effect
title: resources.scala
tree_path: src/main/scala/ch_02/resources.scala
source_path: cats-effect/src/main/scala/ch_02/resources.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats-effect/src/main/scala/ch_02/resources.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats Effect
  url: "/zibaldone-scala/cats-effect/"
- label: ch_02
  url: ''
document_id: cats-effect:src/main/scala/ch_02/resources.scala
description: resources.scala notes
---

~~~scala
package ch_02

import cats.effect.*
import java.util.Scanner

object resources:

  // ex. refactor ch_02.brackets.fileReader
  def fileReader(path: String): IO[Unit] =
    Resource.make(ch_02.brackets.fileScanner(path))(scanner => IO(scanner.close())).use(ch_02.brackets.scannerReader)

  // ex. refactor ch_02.brackets.connectionFromConfig
  // resources compose, brackets do not
  def connectionFromConfig(path: String): IO[Unit] =
    val connection =
      for
        scanner <- Resource.make(ch_02.brackets.fileScanner(path))(scanner => IO(scanner.close()))
        conn    <- Resource.make(IO.pure(Connection(scanner.nextLine)))(_.close)
      yield conn

    connection.use(_.open)
~~~
