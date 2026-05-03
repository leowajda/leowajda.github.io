def firstFeasible(low0: Int, high0: Int): Int =
  var low = low0
  var high = high0
  while low < high do
    val mid = low + (high - low) / 2
    if feasible(mid) then high = mid
    else low = mid + 1
  low
