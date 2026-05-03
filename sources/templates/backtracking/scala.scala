def search(state: State, path: List[Choice], answer: scala.collection.mutable.Buffer[List[Choice]]): Unit =
  if complete(state) then answer += path
  else
    for choice <- choices(state) do
      if valid(state, choice) then
        applyChoice(state, choice)
        search(state, path :+ choice, answer)
        undoChoice(state, choice)
