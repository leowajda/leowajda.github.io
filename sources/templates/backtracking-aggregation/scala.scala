def search(state: State): Int =
  if complete(state) then value(state)
  else
    var answer = identity()
    for choice <- choices(state) do
      if valid(state, choice) then
        applyChoice(state, choice)
        answer = combine(answer, search(state))
        undoChoice(state, choice)
    answer
