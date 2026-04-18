---
problem_slug: merge-k-sorted-lists
problem_title: Merge k Sorted Lists
problem_source_url: https://leetcode.com/problems/merge-k-sorted-lists
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Merge k Sorted Lists · Java Iterative
description: Merge k Sorted Lists solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/linked_list/iterative/MergeKSortedLists.java
code_language: java
detail_url: "/eureka/problems/merge-k-sorted-lists/#java-iterative"
embed_url: "/eureka/problems/merge-k-sorted-lists/embed/java-iterative/"
project_slug: eureka
---

~~~java
package linked_list.iterative;

import linked_list.ListNode;

import java.util.*;

public class MergeKSortedLists {

    public ListNode mergeKLists(ListNode[] lists) {
        Queue<ListNode> queue = new PriorityQueue<>(Comparator.comparingInt(node -> node.val));
        Arrays.stream(lists).filter(Objects::nonNull).forEach(queue::add);

        ListNode head = new ListNode(-1);
        ListNode ptr  = head;

        while (!queue.isEmpty()) {
            var node     = queue.remove();
            var nextList = node.next;
            node.next    = null;
            ptr.next     = node;
            ptr          = ptr.next;
            if (nextList != null) queue.add(nextList);
        }

        return head.next;
    }

}
~~~
