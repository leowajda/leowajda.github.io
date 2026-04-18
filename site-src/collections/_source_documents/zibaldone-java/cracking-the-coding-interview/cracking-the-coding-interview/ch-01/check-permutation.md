---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: CheckPermutation.java
tree_path: src/main/java/cracking_the_coding_interview/ch_01/CheckPermutation.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/CheckPermutation.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/CheckPermutation.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_01/CheckPermutation.java
description: CheckPermutation.java notes
---

~~~java
package cracking_the_coding_interview.ch_01;

import java.util.stream.IntStream;

public class CheckPermutation {

    private static boolean checkPermutation(String a, String b) {
        if (a.length() != b.length())
            return false;

        int[] counter = new int[128];

        // assumes ASCII
        for (int i = 0; i < a.length(); i++) {
            char aChar = a.charAt(i), bChar = b.charAt(i);
            counter[aChar]++;
            counter[bChar]--;
        }

        return IntStream.of(counter).allMatch(num -> num == 0);
    }

}
~~~
