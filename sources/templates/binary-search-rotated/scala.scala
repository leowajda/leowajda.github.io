def searchRotated(values: Array[Int], target: Int): Int =
  var left = 0
  var right = values.length - 1
  while left <= right do
    val mid = left + (right - left) / 2
    if values(mid) == target then return mid
    if values(left) <= values(mid) then
      if values(left) <= target && target < values(mid) then right = mid - 1
      else left = mid + 1
    else if values(mid) < target && target <= values(right) then left = mid + 1
    else right = mid - 1
  -1
