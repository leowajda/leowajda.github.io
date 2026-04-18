---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: invariant.scala
tree_path: src/main/scala/ch_04/invariant.scala
source_path: cats/src/main/scala/ch_04/invariant.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_04/invariant.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_04
  url: ''
document_id: cats:src/main/scala/ch_04/invariant.scala
description: invariant.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_04

trait Crypto[A]:
  self =>

  def encrypt(value: A): String
  def decrypt(value: String): A

  def imap[B](back: B => A)(forth: A => B): Crypto[B] = new Crypto[B]:

    override def encrypt(value: B): String = self.encrypt(back(value))
    override def decrypt(value: String): B = forth(self.decrypt(value))

object Crypto:

  given caesarCypher: Crypto[String] = new Crypto[String]:

    override def encrypt(value: String): String = value.map { c => (c + 2).toChar }
    override def decrypt(value: String): String = value.map { c => (c - 2).toChar }

  given doubleCypher: Crypto[Double]            = caesarCypher.imap[Double](_.toString)(_.toDouble)
  // ex. Option[String]
  given optCaesarCypher: Crypto[Option[String]] = caesarCypher.imap[Option[String]](_.getOrElse(""))(Option(_))

  extension [A: Crypto as crypto](value: A)
    def encrypt: String = crypto.encrypt(value)

  extension (value: String)
    def decrypt[A: Crypto as crypto]: A = crypto.decrypt(value)

trait `invariant`[F[_]]:
  def imap[A, B](fa: F[A])(forth: A => B)(back: B => A): F[B]
~~~
