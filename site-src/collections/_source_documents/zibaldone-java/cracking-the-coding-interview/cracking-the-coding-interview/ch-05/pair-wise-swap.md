---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: PairWiseSwap.java
tree_path: src/main/java/cracking_the_coding_interview/ch_05/PairWiseSwap.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/PairWiseSwap.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/PairWiseSwap.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_05/PairWiseSwap.java
description: PairWiseSwap.java notes
---

~~~java
package cracking_the_coding_interview.ch_05;

public class PairWiseSwap {

    private static final int ODD_BITS  = 0xAAAAAAAA;
    private static final int EVEN_BITS = 0x55555555;

    private static int pairWiseSwap(int num) {
        return ((num & ODD_BITS >>> 1) | (num & EVEN_BITS << 1));
    }

}
~~~
