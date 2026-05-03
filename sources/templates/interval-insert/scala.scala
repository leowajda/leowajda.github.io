def insertInterval(intervals: Vector[Interval], next0: Interval): Vector[Interval] =
  val answer = scala.collection.mutable.Buffer[Interval]()
  var next = next0
  var i = 0
  while i < intervals.length && intervals(i).end < next.start do
    answer += intervals(i)
    i += 1
  while i < intervals.length && intervals(i).start <= next.end do
    next = merge(next, intervals(i))
    i += 1
  (answer :+ next).toVector ++ intervals.drop(i)
