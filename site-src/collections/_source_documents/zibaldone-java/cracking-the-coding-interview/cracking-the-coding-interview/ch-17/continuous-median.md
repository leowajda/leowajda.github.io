---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: ContinuousMedian.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/ContinuousMedian.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/ContinuousMedian.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/ContinuousMedian.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/ContinuousMedian.java
description: ContinuousMedian.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.Queue;

public class ContinuousMedian {

    private final Queue<Integer> left;
    private final Queue<Integer> right;
    private boolean isEven;

    public ContinuousMedian() {
        this.left = new PriorityQueue<>(Comparator.reverseOrder());
        this.right = new PriorityQueue<>(Comparator.naturalOrder());
        this.isEven = true;
    }

    public void addNum(int num) {
        if (isEven) {
            right.add(num);
            left.add(right.remove());
        } else {
            left.add(num);
            right.add(left.remove());
        }
        isEven = !isEven;
    }

    public double findMedian() {
        if (left.size() > right.size()) return left.peek();
        return ((left.peek() + right.peek()) / 2.0);
    }

}
~~~
