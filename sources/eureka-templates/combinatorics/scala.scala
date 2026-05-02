def combinations(n: Int): Array[Array[Long]] =
  val choose = Array.fill(n + 1, n + 1)(0L)
  for i <- 0 to n do
    choose(i)(0) = 1
    choose(i)(i) = 1
    for j <- 1 until i do choose(i)(j) = choose(i - 1)(j - 1) + choose(i - 1)(j)
  choose
