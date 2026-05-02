def compact(values: Array[Int]): Int =
  var write = 0
  for read <- values.indices do
    if keep(values(read)) then
      values(write) = transform(values(read))
      write += 1
  write
