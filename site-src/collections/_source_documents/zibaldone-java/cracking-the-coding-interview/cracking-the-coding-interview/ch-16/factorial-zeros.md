---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: FactorialZeros.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/FactorialZeros.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/FactorialZeros.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/FactorialZeros.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/FactorialZeros.java
description: FactorialZeros.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

public class FactorialZeros {

    private static int factorialZeros(int n) {

        int factorialZeros = 0;
        while (n >= 5) {
            factorialZeros += n / 5;
            n /= 5;
        }

        return factorialZeros;
    }

}
~~~
