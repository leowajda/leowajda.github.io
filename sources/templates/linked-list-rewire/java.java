ListNode reverse(ListNode head) {
    ListNode previous = null;
    while (head != null) {
        ListNode next = head.next;
        head.next = previous;
        previous = head;
        head = next;
    }
    return previous;
}
