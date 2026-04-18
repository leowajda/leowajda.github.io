---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: TowersOfHanoi.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/TowersOfHanoi.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/TowersOfHanoi.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/TowersOfHanoi.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/TowersOfHanoi.java
description: TowersOfHanoi.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

import java.util.Deque;

public class TowersOfHanoi {

    private static void move(int n, Deque<Integer> origin, Deque<Integer> destination, Deque<Integer> buffer) {
        if (n <= 0) return;
        move(n - 1, origin, buffer, destination);
        destination.push(origin.pop());
        move(n - 1, buffer, destination, origin);
    }

}
~~~
