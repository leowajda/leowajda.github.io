def parse(tokens: Iterable[Token]): Unit =
  val stack = scala.collection.mutable.Stack[Token]()
  for token <- tokens do
    if opens(token) then stack.push(token)
    else resolve(stack.pop(), token)
