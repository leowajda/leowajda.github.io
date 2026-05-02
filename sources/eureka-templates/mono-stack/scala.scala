def nextGreater(values: Array[Int]): Array[Int] =
  val answer = Array.fill(values.length)(-1)
  val stack = scala.collection.mutable.Stack[Int]()
  for i <- values.indices do
    while stack.nonEmpty && values(stack.top) < values(i) do answer(stack.pop()) = i
    stack.push(i)
  answer
