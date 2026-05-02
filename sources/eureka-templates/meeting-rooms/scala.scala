def maxConcurrent(intervals: Vector[Interval]): Int =
  var active = 0
  var best = 0
  for event <- eventsFrom(intervals).sortBy(byTimeThenEndBeforeStart) do
    active += event.delta
    best = best.max(active)
  best
