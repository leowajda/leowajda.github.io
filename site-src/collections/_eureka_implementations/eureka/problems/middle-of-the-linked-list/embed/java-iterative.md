---
problem_slug: middle-of-the-linked-list
problem_title: Middle of the Linked List
problem_source_url: https://leetcode.com/problems/middle-of-the-linked-list
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Middle of the Linked List · Java Iterative
description: Middle of the Linked List solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/linked_list/iterative/MiddleOfTheLinkedList.java
code_language: java
detail_url: "/eureka/problems/middle-of-the-linked-list/#java-iterative"
embed_url: "/eureka/problems/middle-of-the-linked-list/embed/java-iterative/"
project_slug: eureka
---

~~~java
package linked_list.iterative;

import linked_list.ListNode;

public class MiddleOfTheLinkedList {

    public ListNode middleNode(ListNode head) {

        ListNode slow = head, fast = head;

        while (fast != null && fast.next != null) {
            fast = fast.next.next;
            slow = slow.next;
        }

        return slow;
    }

}
~~~
