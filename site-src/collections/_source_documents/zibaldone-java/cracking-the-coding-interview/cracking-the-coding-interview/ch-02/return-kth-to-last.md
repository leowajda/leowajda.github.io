---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: ReturnKthToLast.java
tree_path: src/main/java/cracking_the_coding_interview/ch_02/ReturnKthToLast.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/ReturnKthToLast.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/ReturnKthToLast.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_02/ReturnKthToLast.java
description: ReturnKthToLast.java notes
---

~~~java
package cracking_the_coding_interview.ch_02;

public class ReturnKthToLast {

    private static Node kthToLast(Node head, int k) {
        Node slow = head, fast = head;

        for (int i = 0; i < k; i++)
            if (fast == null) return null;
            else              fast = fast.next;

        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }

        return slow;
    }

}
~~~
