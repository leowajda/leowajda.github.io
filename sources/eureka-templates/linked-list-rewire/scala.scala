def reverse(head0: ListNode): ListNode =
  var head = head0
  var previous: ListNode = null
  while head != null do
    val next = head.next
    head.next = previous
    previous = head
    head = next
  previous
