def rollingHash(text: String, base: Long, mod: Long): Array[Long] =
  val hash = Array.fill(text.length + 1)(0L)
  for i <- text.indices do
    hash(i + 1) = (hash(i) * base + text(i).toLong) % mod
  hash
