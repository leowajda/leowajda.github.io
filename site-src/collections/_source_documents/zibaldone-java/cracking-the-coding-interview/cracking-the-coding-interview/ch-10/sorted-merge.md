---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: SortedMerge.java
tree_path: src/main/java/cracking_the_coding_interview/ch_10/SortedMerge.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/SortedMerge.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/SortedMerge.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_10
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_10/SortedMerge.java
description: SortedMerge.java notes
---

~~~java
package cracking_the_coding_interview.ch_10;

public class SortedMerge {

    private static void sortedMerge(int[] a, int[] b, int lastA, int lastB) {
        int aPtr = lastA, bPtr = lastB;
        int pos  = a.length - 1;

        while (aPtr >= 0 && bPtr >= 0) a[pos--] = a[aPtr] >= b[bPtr] ? a[aPtr--] : b[bPtr--];
        while (aPtr >= 0)              a[pos--] = a[aPtr--];
        while (bPtr >= 0)              a[pos--] = b[bPtr--];
    }

}
~~~
