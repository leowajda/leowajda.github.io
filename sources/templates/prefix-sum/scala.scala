def prefixSums(values: Array[Int]): Array[Int] =
  val prefix = Array.fill(values.length + 1)(0)
  for i <- values.indices do prefix(i + 1) = prefix(i) + values(i)
  prefix

def rangeSum(prefix: Array[Int], left: Int, right: Int): Int =
  prefix(right) - prefix(left)
