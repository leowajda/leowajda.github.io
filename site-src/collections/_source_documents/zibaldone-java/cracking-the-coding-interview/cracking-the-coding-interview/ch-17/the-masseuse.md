---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: TheMasseuse.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/TheMasseuse.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/TheMasseuse.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/TheMasseuse.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/TheMasseuse.java
description: TheMasseuse.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.stream.IntStream;

public class TheMasseuse {

    private static int theMasseuse(int[] appointments) {

        int n = appointments.length;
        if (n <= 2) return IntStream.of(appointments).max().orElse(-1);

        int a = appointments[0], b = appointments[1];
        for (int i = 2; i < n; i++) {
            int c = Math.max(b, a + appointments[i]);
            a = b;
            b = c;
        }

        return b;
    }

}
~~~
