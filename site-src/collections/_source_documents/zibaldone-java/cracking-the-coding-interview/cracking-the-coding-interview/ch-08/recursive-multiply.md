---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: RecursiveMultiply.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/RecursiveMultiply.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/RecursiveMultiply.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/RecursiveMultiply.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_08
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/RecursiveMultiply.java
description: RecursiveMultiply.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

public class RecursiveMultiply {

    // the recursion requirement is left for the reader's imagination
    private static int multiply(int a, int b) {
        int multipliedNum = 0;
        while (b > 0) {
            if ((b & 1) == 1)
                multipliedNum += a;

            b >>= 1;
            a <<= 1;
        }
        return  multipliedNum;
    }

}
~~~
