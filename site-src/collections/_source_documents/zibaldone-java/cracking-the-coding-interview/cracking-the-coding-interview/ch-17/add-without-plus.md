---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: AddWithoutPlus.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/AddWithoutPlus.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/AddWithoutPlus.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/AddWithoutPlus.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_17
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/AddWithoutPlus.java
description: AddWithoutPlus.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

public class AddWithoutPlus {

    private static int add(int a, int b) {

        while (b != 0) {
            int sumNoCarry  = a ^ b;
            int carry       = (a & b) << 1;
            a = sumNoCarry;
            b = carry;
        }

        return a;
    }

}
~~~
