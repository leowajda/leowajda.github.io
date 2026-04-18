---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: TripleStep.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/TripleStep.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/TripleStep.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/TripleStep.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/TripleStep.java
description: TripleStep.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

public class TripleStep {

    private static int tripleStep(int n) {
        int a = 1, b = 2, c = 4;
        if (n <= 3) return n == 3 ? c : n;

        for (int i = 4; i <= n; i++) {
            int d = a + b + c;
            a = b;
            b = c;
            c = d;
        }

        return c;
    }

}
~~~
