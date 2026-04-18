---
problem_slug: linked-list-cycle
problem_title: Linked List Cycle
problem_source_url: https://leetcode.com/problems/linked-list-cycle
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Linked List Cycle · Java Iterative
description: Linked List Cycle solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/linked_list/iterative/LinkedListCycle.java
code_language: java
detail_url: "/eureka/problems/linked-list-cycle/#java-iterative"
embed_url: "/eureka/problems/linked-list-cycle/embed/java-iterative/"
project_slug: eureka
---

~~~java
package linked_list.iterative;

import linked_list.ListNode;

public class LinkedListCycle {

    public boolean hasCycle(ListNode head) {

        ListNode slow = head, fast = head;

        while (fast != null && fast.next != null) {
            fast = fast.next.next;
            slow = slow.next;

            if (fast == slow) return true;
        }

        return false;
    }

}
~~~
