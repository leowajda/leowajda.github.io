def select(values: Array[Int], k: Int): Int =
  var left = 0
  var right = values.length - 1
  while left <= right do
    val pivot = partition(values, left, right)
    if pivot == k then return values(pivot)
    if pivot < k then left = pivot + 1
    else right = pivot - 1
  -1
