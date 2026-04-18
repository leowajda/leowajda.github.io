---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: writer.scala
tree_path: src/main/scala/ch_02/writer.scala
source_path: cats/src/main/scala/ch_02/writer.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_02/writer.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_02
  url: ''
document_id: cats:src/main/scala/ch_02/writer.scala
description: writer.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_02

import cats.Semigroup
import cats.data.Writer
import cats.instances.vector.*
import cats.syntax.semigroup.*

def combineLogs[B: Semigroup, A: Semigroup](writerA: Writer[B, A])(writerB: Writer[B, A]): Writer[B, A] =
  for
    a <- writerA // Semigroup[B] for combining the logs
    b <- writerB
  yield a |+| b

// ex. log using writer
def countAndPrint(n: Int): Writer[Vector[String], Int]                                                               =
  if n <= 0 then Writer(Vector.empty, 0) else countAndPrint(n - 1).flatMap(_ => Writer(Vector(s"logging $n"), n))

// ex. naive sum
def naiveSum(n: Int): Writer[Vector[String], Int]                                                                    =
  if n <= 0 then Writer(Vector.empty, 0)
  else
    // works safely in multithreaded environments
    for
      _        <- Writer(Vector(s"Now at $n"), n)
      lowerSum <- naiveSum(n - 1)
      _        <- Writer(Vector(s"Computed naiveSum(${n - 1}) = $lowerSum"), n)
    yield lowerSum + n
~~~
