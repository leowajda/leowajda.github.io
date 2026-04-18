---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: Conversion.java
tree_path: src/main/java/cracking_the_coding_interview/ch_05/Conversion.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/Conversion.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/Conversion.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_05/Conversion.java
description: Conversion.java notes
---

~~~java
package cracking_the_coding_interview.ch_05;

public class Conversion {

    private static int convert(int a, int b) {
        int counter = 0;
        for (int c = a ^ b; c != 0; c &= c - 1) counter++;
        return counter;
    }

}
~~~
