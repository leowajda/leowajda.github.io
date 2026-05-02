def gcd(a0: Int, b0: Int): Int =
  var a = a0
  var b = b0
  while b != 0 do
    val next = a % b
    a = b
    b = next
  a.abs
