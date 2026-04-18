---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: Shuffle.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/Shuffle.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/Shuffle.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/Shuffle.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/Shuffle.java
description: Shuffle.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

public class Shuffle {

    private static int randomNum(int from, int to) {
        return from + (int) (Math.random() * (to - from + 1));
    }

    private static int[] shuffle(int[] cards) {

        for (int i = 0; i  < cards.length; i++) {
            int pos = randomNum(0, i);

            int tmp     = cards[pos];
            cards[pos]  = cards[i];
            cards[i]    = tmp;
        }

        return cards;
    }

}
~~~
