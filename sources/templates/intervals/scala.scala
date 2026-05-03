def mergeIntervals(intervals: Vector[Interval]): Vector[Interval] =
  val merged = scala.collection.mutable.Buffer[Interval]()
  for current <- intervals.sortBy(_.start) do
    if merged.isEmpty || merged.last.end < current.start then merged += current
    else merged.last.end = merged.last.end.max(current.end)
  merged.toVector
