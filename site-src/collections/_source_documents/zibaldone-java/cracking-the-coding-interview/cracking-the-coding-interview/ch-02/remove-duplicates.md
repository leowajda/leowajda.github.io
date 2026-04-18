---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: RemoveDuplicates.java
tree_path: src/main/java/cracking_the_coding_interview/ch_02/RemoveDuplicates.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/RemoveDuplicates.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/RemoveDuplicates.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_02
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_02/RemoveDuplicates.java
description: RemoveDuplicates.java notes
---

~~~java
package cracking_the_coding_interview.ch_02;

import java.util.HashSet;
import java.util.Set;

public class RemoveDuplicates {

    private static void removeDuplicates(Node head) {
        Set<Integer> seen = new HashSet<>();
        Node prev = head;

        while (head != null) {
            if (seen.add(head.val)) prev = head;
            else                    prev.next = head.next;
            head = head.next;
        }
    }

}
~~~
