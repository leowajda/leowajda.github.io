def sieve(n: Int): Array[Boolean] =
  val prime = Array.fill(n + 1)(true)
  if n >= 0 then prime(0) = false
  if n >= 1 then prime(1) = false
  var p = 2
  while p * p <= n do
    if prime(p) then
      for x <- p * p to n by p do prime(x) = false
    p += 1
  prime
