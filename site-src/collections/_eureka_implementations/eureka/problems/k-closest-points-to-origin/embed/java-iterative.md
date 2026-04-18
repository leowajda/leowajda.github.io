---
problem_slug: k-closest-points-to-origin
problem_title: K Closest Points to Origin
problem_source_url: https://leetcode.com/problems/k-closest-points-to-origin
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: K Closest Points to Origin · Java Iterative
description: K Closest Points to Origin solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/KClosestPointsToOrigin.java
code_language: java
detail_url: "/eureka/problems/k-closest-points-to-origin/#java-iterative"
embed_url: "/eureka/problems/k-closest-points-to-origin/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.Queue;

public class KClosestPointsToOrigin {

    public int[][] kClosest(int[][] points, int k) {
        Queue<int[]> queue = new PriorityQueue<>(
                Comparator.comparingDouble(KClosestPointsToOrigin::euclideanDistance).reversed()
        );

        for (var point : points) {
            queue.add(point);
            if (queue.size() > k)
                queue.remove();
        }

        return queue.toArray(int[][]::new);
    }

    private static double euclideanDistance(int[] point) {
        int x = point[0], y = point[1];
        return (x * x) + (y * y);
    }

}
~~~
