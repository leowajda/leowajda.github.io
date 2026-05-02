def greedy(items: Iterable[Item]): Int =
  var answer = initial()
  for item <- items do
    if forced(item) then answer = take(answer, item)
  answer
