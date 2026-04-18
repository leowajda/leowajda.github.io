---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: Insertion.java
tree_path: src/main/java/cracking_the_coding_interview/ch_05/Insertion.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/Insertion.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/Insertion.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_05
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_05/Insertion.java
description: Insertion.java notes
---

~~~java
package cracking_the_coding_interview.ch_05;

public class Insertion {

    public int insert(int m, int n, int j, int i) {

        int bottomMask = (~0 << (j + 1));
        int topMask    = ((1 << i) - 1);

        n &= (bottomMask | topMask);
        return n | (m << i);
    }

}
~~~
