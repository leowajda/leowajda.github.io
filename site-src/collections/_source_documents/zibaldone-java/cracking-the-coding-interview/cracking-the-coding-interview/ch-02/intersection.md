---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: Intersection.java
tree_path: src/main/java/cracking_the_coding_interview/ch_02/Intersection.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/Intersection.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/Intersection.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_02/Intersection.java
description: Intersection.java notes
---

~~~java
package cracking_the_coding_interview.ch_02;

public class Intersection {

    private static Node getIntersectionNode(Node a, Node b) {

        Node aPtr = a, bPtr = b;

        // both pointers eventually traverse the same amount of nodes A + B
        while (aPtr != bPtr) {
            aPtr = (aPtr == null) ? b : aPtr.next;
            bPtr = (bPtr == null) ? a : bPtr.next;
        }

        return aPtr;
    }

}
~~~
