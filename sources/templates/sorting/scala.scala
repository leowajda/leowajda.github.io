def sortAndScan(items: Vector[Item]): Int =
  var answer = initial()
  for item <- items.sortBy(order) do
    answer = consume(answer, item)
  answer
