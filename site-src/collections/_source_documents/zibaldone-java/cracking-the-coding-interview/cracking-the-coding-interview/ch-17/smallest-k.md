---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: SmallestK.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/SmallestK.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/SmallestK.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/SmallestK.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/SmallestK.java
description: SmallestK.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;
import java.util.Queue;

public class SmallestK {

    private static List<Integer> smallestK(List<Integer> nums, int k) {

        Queue<Integer> queue = new PriorityQueue<>(Comparator.reverseOrder());

        for (var num : nums)
            if (queue.size() < k) queue.add(num);
            else                  queue.add(Math.min(num, queue.remove()));

        return queue.stream().toList();
    }

}
~~~
