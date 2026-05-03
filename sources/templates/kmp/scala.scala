def prefixTable(pattern: String): Array[Int] =
  val prefix = Array.fill(pattern.length)(0)
  var j = 0
  for i <- 1 until pattern.length do
    while j > 0 && pattern(i) != pattern(j) do j = prefix(j - 1)
    if pattern(i) == pattern(j) then j += 1
    prefix(i) = j
  prefix
