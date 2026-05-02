def merge(a0: ListNode, b0: ListNode): ListNode =
  var a = a0
  var b = b0
  val dummy = ListNode(0)
  var tail = dummy
  while a != null && b != null do
    if a.value <= b.value then
      tail.next = a
      a = a.next
    else
      tail.next = b
      b = b.next
    tail = tail.next
  tail.next = if a != null then a else b
  dummy.next
