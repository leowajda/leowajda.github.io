def sweep(events: Vector[Event]): Int =
  var active = 0
  var answer = initial()
  for event <- events.sortBy(eventOrder) do
    active += event.delta
    answer = update(answer, event, active)
  answer
