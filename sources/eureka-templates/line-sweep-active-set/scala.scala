def sweepWithActiveSet(events: Vector[Event]): Unit =
  val active = scala.collection.mutable.TreeSet[Item]()(itemOrder)
  for event <- events.sortBy(eventOrder) do
    if event.starts then active += event.item
    else active -= event.item
    use(active, event)
