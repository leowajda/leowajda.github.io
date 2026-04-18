---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: monad.scala
tree_path: src/main/scala/ch_01/monad.scala
source_path: cats/src/main/scala/ch_01/monad.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_01/monad.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_01
  url: ''
document_id: cats:src/main/scala/ch_01/monad.scala
description: monad.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_01

import cats.syntax.applicative.*
import cats.syntax.flatMap.*
import cats.syntax.functor.*
import cats.{FlatMap, Monad}

import scala.annotation.tailrec
import scala.collection.mutable
import scala.util.Try

// flatMap is a mental model of chained transformations
extension [F[_]: FlatMap, A](container: F[A])

  // ex. return all combinations (A, B)
  def combine[B](otherContainer: F[B]): F[(A, B)] =
    for // a.k.a `product` from the Semigroupal typeclass
      a <- container
      b <- otherContainer
    yield (a, b)

trait `monad`[F[_]] extends ch_03.`applicative`[F] with ch_03.`flatMap`[F]:

  // ex. implement map
  final override def map[A, B](fa: F[A])(f: A => B): F[B] = flatMap(fa)(a => pure(f(a)))

  final override def product[A, B](fa: F[A], fb: F[B]): F[(A, B)] =
    flatMap(fa)(a => map(fb)(b => (a, b)))

// ex. service layer API
final case class Connection(host: String, port: String)

sealed trait HttpService[F[_]: Monad]:

  def connection(config: Map[String, String]): F[Connection]

  def request(connection: Connection, payload: String): F[Int]

  def response(config: Map[String, String], payload: String): F[Int] =
    for connection <- connection(config); response <- request(connection, payload) yield response

object OptionalHttpService extends HttpService[Option]:

  override def connection(config: Map[String, String]): Option[Connection] =
    Option.when(config.contains("host") && config.contains("port")) { Connection(config("host"), config("port")) }

  override def request(connection: Connection, payload: String): Option[Int] =
    Option.when(payload.length >= 20) { 42 }

object TryHttpService extends HttpService[Try]:

  override def connection(config: Map[String, String]): Try[Connection] =
    Try { Connection(config("host"), config("port")) }

  override def request(connection: Connection, payload: String): Try[Int] =
    Try { if payload.length < 20 then throw new IllegalArgumentException() else 42 }

// ex. monad for identity type
opaque type Id[A] = A

given Monad[Id] = new Monad[Id]:

  override def pure[A](x: A): Id[A] = x

  override def flatMap[A, B](fa: Id[A])(f: A => Id[B]): Id[B] = f(fa)

  @tailrec override def tailRecM[A, B](a: A)(f: A => Id[Either[A, B]]): Id[B] = f(a) match
    case Left(value)  => tailRecM(value)(f) // left == false
    case Right(value) => value              // right == true

// ex. monad for tree type
enum BinaryTree[+T]:

  case Leaf(value: T)
  case Branch(left: BinaryTree[T], right: BinaryTree[T])

  // for simplicity only hashes on the memory ref
  override def hashCode(): Int = System.identityHashCode(this)

given Monad[BinaryTree] = new Monad[BinaryTree]:

  import ch_01.BinaryTree.{Branch, Leaf}

  override def pure[A](x: A): BinaryTree[A] = Leaf(x)

  override def flatMap[A, B](fa: BinaryTree[A])(f: A => BinaryTree[B]): BinaryTree[B] = fa match
    case Leaf(value)         => f(value)
    case Branch(left, right) => Branch(flatMap(left)(f), flatMap(right)(f))

  override def tailRecM[A, B](a: A)(f: A => BinaryTree[Either[A, B]]): BinaryTree[B] =

    @tailrec def loop(
      notVisited: List[BinaryTree[Either[A, B]]],
      visited: mutable.Set[BinaryTree[Either[A, B]]],
      done: List[BinaryTree[B]]
    ): BinaryTree[B] = notVisited match
      case Nil          => done.head
      case head :: next => head match
          case Leaf(Right(value))                           => loop(next, visited, Leaf(value) :: done)
          case Leaf(Left(value))                            => loop(f(value) :: next, visited, done)
          case root @ Branch(left, right) if !visited(root) => loop(right :: left :: notVisited, visited + root, done)
          case root @ Branch(left, right)                   => loop(next, visited, Branch(done.head, done.tail.head) :: done.drop(2))

    loop(f(a) :: Nil, mutable.Set.empty, Nil)
~~~
