---
problem_slug: minimum-path-sum
problem_title: Minimum Path Sum
problem_source_url: https://leetcode.com/problems/minimum-path-sum
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Minimum Path Sum · Java Iterative
description: Minimum Path Sum solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/MinimumPathSum.java
code_language: java
detail_url: "/eureka/problems/minimum-path-sum/#java-iterative"
embed_url: "/eureka/problems/minimum-path-sum/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

public class MinimumPathSum {

    public int minPathSum(int[][] grid) {

        int rows = grid.length;
        int cols = grid[0].length;

        for (int row = 1; row < rows; row++)
            grid[row][0] += grid[row - 1][0];

        for (int col = 1; col < cols; col++)
            grid[0][col] += grid[0][col - 1];

        for (int row = 1; row < rows; row++)
            for (int col = 1; col < cols; col++)
                grid[row][col] += Math.min(grid[row - 1][col], grid[row][col - 1]);

        return grid[rows - 1][cols - 1];
    }

}
~~~
