def greedyAfterSort(items: Vector[Item]): Int =
  var answer = initial()
  for item <- items.sortBy(priority) do
    if compatible(item) then answer = take(answer, item)
  answer
