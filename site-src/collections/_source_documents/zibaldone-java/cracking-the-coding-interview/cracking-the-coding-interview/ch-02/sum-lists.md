---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: SumLists.java
tree_path: src/main/java/cracking_the_coding_interview/ch_02/SumLists.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/SumLists.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/SumLists.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_02/SumLists.java
description: SumLists.java notes
---

~~~java
package cracking_the_coding_interview.ch_02;

public class SumLists {

    private static Node sum(Node a, Node b) {

        Node c = new Node(-1);
        Node aPtr = a, bPtr = b, cPtr = c;

        int carry = 0;
        while (aPtr != null || bPtr != null) {

            int aVal = (aPtr == null) ? 0 : aPtr.val;
            int bVal = (bPtr == null) ? 0 : bPtr.val;

            carry += aVal + bVal;
            cPtr.next = new Node(carry % 10);
            cPtr = cPtr.next;
            carry /= 10;

            if (aPtr != null) aPtr = aPtr.next;
            if (bPtr != null) bPtr = bPtr.next;
        }

        if (carry != 0) cPtr.next = new Node(carry);
        return c.next;
    }

}
~~~
