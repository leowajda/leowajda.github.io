def scanInward(values: Array[Int]): Unit =
  var left = 0
  var right = values.length - 1
  while left < right do
    use(values(left), values(right))
    if moveLeft(values(left), values(right)) then left += 1
    else right -= 1
