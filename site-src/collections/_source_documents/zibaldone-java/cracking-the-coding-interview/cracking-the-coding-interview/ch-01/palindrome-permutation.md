---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: PalindromePermutation.java
tree_path: src/main/java/cracking_the_coding_interview/ch_01/PalindromePermutation.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/PalindromePermutation.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/PalindromePermutation.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_01/PalindromePermutation.java
description: PalindromePermutation.java notes
---

~~~java
package cracking_the_coding_interview.ch_01;

public class PalindromePermutation {

    private static boolean isPalindromePermutation(String s) {

        int bitMask = 0b0;
        // assumes ASCII in range 'a' - 'z'
        for (int i = 0; i < s.length(); i++) {
            int val = s.charAt(i) - 'a';
            bitMask ^= (1 << val);
        }

        return bitMask == 0 || ((bitMask & (bitMask - 1)) == 0);
    }

}
~~~
