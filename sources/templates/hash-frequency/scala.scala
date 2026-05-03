def frequencies(items: Iterable[Item]): Map[Key, Int] =
  val counts = scala.collection.mutable.Map[Key, Int]().withDefaultValue(0)
  for item <- items do
    val key = keyOf(item)
    counts(key) += 1
  counts.toMap
