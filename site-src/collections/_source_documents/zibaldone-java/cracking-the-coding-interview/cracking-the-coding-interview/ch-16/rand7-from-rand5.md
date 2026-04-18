---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: Rand7FromRand5.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/Rand7FromRand5.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/Rand7FromRand5.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/Rand7FromRand5.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/Rand7FromRand5.java
description: Rand7FromRand5.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

public abstract class Rand7FromRand5 {

    public abstract int getRand5();

    // getRand5() + getRand5() leads to an unbalanced distribution
    // increasing the range to [0, 21] fixes the problem because 21 % 7 == 0
    public int getRand7() {
        while (true) {
            int num = 5 * getRand5() + getRand5();
            if (num < 21) return num % 7;
        }
    }

}
~~~
