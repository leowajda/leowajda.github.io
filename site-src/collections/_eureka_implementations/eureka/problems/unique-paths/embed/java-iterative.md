---
problem_slug: unique-paths
problem_title: Unique Paths
problem_source_url: https://leetcode.com/problems/unique-paths
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Unique Paths · Java Iterative
description: Unique Paths solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/UniquePaths.java
code_language: java
detail_url: "/eureka/problems/unique-paths/#java-iterative"
embed_url: "/eureka/problems/unique-paths/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.Arrays;

public class UniquePaths {

    public int uniquePaths(int rows, int cols) {
        int[] prev = new int[cols];
        Arrays.fill(prev, 1);

        for (int row = 1; row < rows; row++)
            for (int col = 1; col < cols; col++)
                prev[col] += prev[col - 1];

        return prev[cols - 1];
    }

}
~~~
