def lookupOrBuild(items: Iterable[Item]): Value =
  val seen = scala.collection.mutable.Map[Key, Value]()
  for item <- items do
    val key = keyOf(item)
    if seen.contains(key) then return merge(seen(key), item)
    seen(key) = valueOf(item)
  emptyValue()
