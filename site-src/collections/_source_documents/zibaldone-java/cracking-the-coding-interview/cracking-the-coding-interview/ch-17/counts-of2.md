---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: CountsOf2.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/CountsOf2.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/CountsOf2.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/CountsOf2.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/CountsOf2.java
description: CountsOf2.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

public class CountsOf2 {

    private static int count2(int num, int d) {
        int power       = (int) Math.pow(10, d);
        int nextPower   = (int) Math.pow(10, d + 1);
        int digit       = (num / power) % 10;
        int lowerBound  = num - (num % nextPower);
        int upperBound  = lowerBound + nextPower;

        if (digit < 2)  return lowerBound / 10;
        if (digit == 2) return (lowerBound / 10) + (num % power) + 1;
        return upperBound / 10;
    }

    private static int count2(int num) {
        int n = String.valueOf(num).length();
        int counter = 0;

        for (int i = 0; i < n; i++)
            counter += count2(num, i);

        return counter;
    }

}
~~~
