def applyRangeUpdates(size: Int, updates: Array[Array[Int]]): Array[Int] =
  val diff = Array.fill(size + 1)(0)
  for update <- updates do
    diff(update(0)) += update(2)
    diff(update(1) + 1) -= update(2)
  val values = Array.fill(size)(0)
  var running = 0
  for i <- 0 until size do
    running += diff(i)
    values(i) = running
  values
