---
problem_slug: triangle
problem_title: Triangle
problem_source_url: https://leetcode.com/problems/triangle
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Triangle · Java Iterative
description: Triangle solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/Triangle.java
code_language: java
detail_url: "/eureka/problems/triangle/#java-iterative"
embed_url: "/eureka/problems/triangle/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.List;

public class Triangle {

    public int minimumTotal(List<List<Integer>> triangle) {

        int rows = triangle.size();

        for (int row = rows - 2; row >= 0; row--) {
            var prevRow = triangle.get(row + 1);
            var currRow = triangle.get(row);

            for (int i = 0; i < currRow.size(); i++) {
                int curr   = currRow.get(i);
                int bottom = prevRow.get(i);
                int right  = prevRow.get(i + 1);

                currRow.set(i, curr + Math.min(bottom, right));
            }

        }

        return triangle.getFirst().getFirst();
    }

}
~~~
