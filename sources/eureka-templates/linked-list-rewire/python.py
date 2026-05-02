def reverse(head):
    previous = None
    while head:
        nxt = head.next
        head.next = previous
        previous = head
        head = nxt
    return previous
