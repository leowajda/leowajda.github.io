---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: DeleteMiddleNode.java
tree_path: src/main/java/cracking_the_coding_interview/ch_02/DeleteMiddleNode.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/DeleteMiddleNode.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_02/DeleteMiddleNode.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_02/DeleteMiddleNode.java
description: DeleteMiddleNode.java notes
---

~~~java
package cracking_the_coding_interview.ch_02;

public class DeleteMiddleNode {

    private static boolean deleteMiddleNode(Node node) {
        if (node == null || node.next == null)
            return false;

        node.val  = node.next.val;
        node.next = node.next.next;
        return true;
    }

}
~~~
