---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: NumberMax.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/NumberMax.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/NumberMax.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/NumberMax.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_16
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/NumberMax.java
description: NumberMax.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

public class NumberMax {

    private static int max(int a, int b) {
        int diff        = a - b;
        int isNegative  = (diff >> 31) & 0x1;
        return a - (diff * isNegative);
    }

}
~~~
