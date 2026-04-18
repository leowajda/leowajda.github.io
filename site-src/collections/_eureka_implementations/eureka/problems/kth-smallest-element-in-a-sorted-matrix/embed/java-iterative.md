---
problem_slug: kth-smallest-element-in-a-sorted-matrix
problem_title: Kth Smallest Element in a Sorted Matrix
problem_source_url: https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Kth Smallest Element in a Sorted Matrix · Java Iterative
description: Kth Smallest Element in a Sorted Matrix solution in Java using the iterative
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/KthSmallestElementInASortedMatrix.java
code_language: java
detail_url: "/eureka/problems/kth-smallest-element-in-a-sorted-matrix/#java-iterative"
embed_url: "/eureka/problems/kth-smallest-element-in-a-sorted-matrix/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.stream.IntStream;

public class KthSmallestElementInASortedMatrix {

    private record Point(int row, int col, int val) {
        public static Point of(int row, int col, int val) {
            return new Point(row, col, val);
        }
    }

    public int kthSmallest(int[][] matrix, int k) {
        int n               = matrix.length;
        Point kthSmallest   = Point.of(-1, -1, -1);
        Queue<Point> queue  = new PriorityQueue<>(Comparator.comparingInt(Point::val));

        queue.addAll(
                IntStream.range(0, n).mapToObj(row -> Point.of(row, 0, matrix[row][0])).toList()
        );

        for (int i = 0; i < k; i++) {
            kthSmallest = queue.remove();
            int nextCol = kthSmallest.col + 1;
            int nextRow = kthSmallest.row;
            if (nextCol == n) continue;
            queue.add(Point.of(nextRow, nextCol, matrix[nextRow][nextCol]));
        }

        return kthSmallest.val;
    }

}
~~~
