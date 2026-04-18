---
problem_slug: find-median-from-data-stream
problem_title: Find Median from Data Stream
problem_source_url: https://leetcode.com/problems/find-median-from-data-stream
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Find Median from Data Stream · Java Iterative
description: Find Median from Data Stream solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/custom/iterative/FindMedianFromDataStream.java
code_language: java
detail_url: "/eureka/problems/find-median-from-data-stream/#java-iterative"
embed_url: "/eureka/problems/find-median-from-data-stream/embed/java-iterative/"
project_slug: eureka
---

~~~java
package custom.iterative;

import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.Queue;

public class FindMedianFromDataStream {

    private final Queue<Integer> left;
    private final Queue<Integer> right;
    private boolean isEven;

    public FindMedianFromDataStream() {
        this.left   = new PriorityQueue<>(Comparator.reverseOrder());
        this.right  = new PriorityQueue<>();
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
        return isEven ? ((left.peek() + right.peek()) / 2.0) : left.peek();
    }

}
~~~
