---
problem_slug: kth-largest-element-in-an-array
problem_title: Kth Largest Element in an Array
problem_source_url: https://leetcode.com/problems/kth-largest-element-in-an-array
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Kth Largest Element in an Array · Java Iterative
description: Kth Largest Element in an Array solution in Java using the iterative
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/KthLargestElementInAnArray.java
code_language: java
detail_url: "/eureka/problems/kth-largest-element-in-an-array/#java-iterative"
embed_url: "/eureka/problems/kth-largest-element-in-an-array/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.PriorityQueue;
import java.util.Queue;

public class KthLargestElementInAnArray {

    public int findKthLargest(int[] nums, int k) {
        Queue<Integer> queue = new PriorityQueue<>(k);

        for (var num : nums) {
            queue.add(num);
            if (queue.size() > k) queue.remove();
        }

        return queue.remove();
    }

}
~~~
