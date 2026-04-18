---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: GraphNode.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/GraphNode.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/GraphNode.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/GraphNode.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_04
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/GraphNode.java
description: GraphNode.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

public class GraphNode {

    public int val;
    public GraphNode[] children;

    public GraphNode(int val) {
        this.val = val;
    }

}
~~~
