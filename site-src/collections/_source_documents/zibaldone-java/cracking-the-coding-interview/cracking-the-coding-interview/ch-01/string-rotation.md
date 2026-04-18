---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: StringRotation.java
tree_path: src/main/java/cracking_the_coding_interview/ch_01/StringRotation.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/StringRotation.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/StringRotation.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_01
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_01/StringRotation.java
description: StringRotation.java notes
---

~~~java
package cracking_the_coding_interview.ch_01;

public class StringRotation {

    private static boolean isRotation(String a, String b) {
        return a.length() == b.length() && a.repeat(2).contains(b);
    }

}
~~~
