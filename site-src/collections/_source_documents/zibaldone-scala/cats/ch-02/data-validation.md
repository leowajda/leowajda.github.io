---
project_slug: zibaldone-scala
module_slug: cats
module_title: Cats
title: dataValidation.scala
tree_path: src/main/scala/ch_02/dataValidation.scala
source_path: cats/src/main/scala/ch_02/dataValidation.scala
source_url: https://github.com/leowajda/zibaldone-scala/blob/master/cats/src/main/scala/ch_02/dataValidation.scala
language: scala
format: code
breadcrumbs:
- label: Zibaldone Scala
  url: "/zibaldone-scala/"
- label: Cats
  url: "/zibaldone-scala/cats/"
- label: ch_02
  url: ''
document_id: cats:src/main/scala/ch_02/dataValidation.scala
description: dataValidation.scala notes
---

~~~scala
package com.zibaldone.cats
package ch_02

import cats.data.Validated
import cats.kernel.Semigroup

import scala.annotation.tailrec

def isPrime(n: Int): Boolean                      =
  @tailrec def loop(d: Int): Boolean = if d <= 1 then true else n % d == 0 && loop(d - 1)
  if n == 0 || n == -1 || n == 1 then false else loop(math.abs(n / 2))

// ex. use Either[A, B]
def testNumber(n: Int): Either[List[String], Int] =

  val isEven      = if n % 2 == 0 then Nil else "not even" :: Nil
  val lessThan100 = if n <= 100 then Nil else "> 100" :: Nil
  val isPositive  = if n >= 0 then Nil else "negative" :: Nil
  val isPrimeNum  = if isPrime(n) then Nil else "non-prime" :: Nil

  val errors = isEven ++ lessThan100 ++ isPositive ++ isPrimeNum
  // Either[A, B] is not ideal for working on the left projections
  if errors.isEmpty then Right(n) else Left(errors)

def validatedNumber(n: Int): Validated[List[String], Int] =

  given Semigroup[Int] = Semigroup.first

  val isEven      = Validated.cond(n % 2 == 0, n, "not even" :: Nil)
  val lessThan100 = Validated.cond(n <= 100, n, "> 100" :: Nil)
  val isPositive  = Validated.cond(n >= 0, n, "negative" :: Nil)
  val isPrimeNum  = Validated.cond(isPrime(n), n, "non-prime" :: Nil)

  isEven.combine(lessThan100).combine(isPositive).combine(isPrimeNum)

// ex. form validation
object Form:

  opaque type FormValidation[A] = Validated[List[String], A]

  private def getField(form: Map[String, String], fieldName: String): FormValidation[String] =
    Validated.fromOption(form.get(fieldName), s"$fieldName is missing" :: Nil)

  private def nonBlank(field: String)(fieldName: String): FormValidation[String] =
    Validated.cond(!field.isBlank, field, s"$fieldName is blank" :: Nil)

  private def isProperEmail(field: String)(fieldName: String): FormValidation[String] =
    Validated.cond(field.contains("@"), field, s"$fieldName is not valid" :: Nil)

  private def isValidPasswordLength(field: String)(fieldName: String): FormValidation[String] =
    Validated.cond(field.length >= 10, field, s"$fieldName is not valid" :: Nil)

  def validateForm(form: Map[String, String]): FormValidation[String] =

    given Semigroup[String] = Semigroup.first // no need to concatenate strings

    val isValidName     = getField(form, "name").andThen(nonBlank("Name"))
    val isValidPassword = getField(form, "password").andThen(isValidPasswordLength("Password"))
    val isValidEmail    = getField(form, "email").andThen(isProperEmail("Email"))

    isValidName.combine(isValidPassword).combine(isValidEmail).map(_ => "OK")
~~~
