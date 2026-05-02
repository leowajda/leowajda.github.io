def findMeetingPoint(head: ListNode): ListNode =
  var slow = head
  var fast = head
  while fast != null && fast.next != null do
    slow = slow.next
    fast = fast.next.next
    if slow == fast then return slow
  null
