def increasingSubsequenceLength(values: Array[Int]): Int =
  val tails = Array.fill(values.length)(0)
  var size = 0
  for value <- values do
    val i = lowerBound(tails, size, value)
    tails(i) = value
    if i == size then size += 1
  size
