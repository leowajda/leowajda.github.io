def lowerBound(values: Array[Int], target: Int): Int =
  var left = 0
  var right = values.length
  while left < right do
    val mid = left + (right - left) / 2
    if values(mid) < target then left = mid + 1
    else right = mid
  left
