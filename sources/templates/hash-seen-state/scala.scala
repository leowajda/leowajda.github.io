def reachesRepeat(start: State): Boolean =
  val seen = scala.collection.mutable.Set[State]()
  var state = start
  while !seen.contains(state) do
    seen += state
    if done(state) then return false
    state = nextState(state)
  true
