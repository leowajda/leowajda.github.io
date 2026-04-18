---
problem_slug: maximal-square
problem_title: Maximal Square
problem_source_url: https://leetcode.com/problems/maximal-square
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Maximal Square · Java Iterative
description: Maximal Square solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/MaximalSquare.java
code_language: java
detail_url: "/eureka/problems/maximal-square/#java-iterative"
embed_url: "/eureka/problems/maximal-square/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

public class MaximalSquare {

    public int maximalSquare(char[][] matrix) {

        int rows = matrix.length;
        int cols = matrix[0].length;

        int[][] memo = new int[rows][cols];
        int squareSide = 0;

        for (int row = 0; row < rows; row++)
            if (matrix[row][cols - 1] == '1') {
                memo[row][cols - 1] = 1;
                squareSide = 1;
            }

        for (int col = 0; col < cols; col++)
            if (matrix[rows - 1][col] == '1') {
                memo[rows - 1][col] = 1;
                squareSide = 1;
            }

        for (int row = rows - 2; row >= 0; row--)
            for (int col = cols - 2; col >= 0; col--)
                if (matrix[row][col] == '1') {

                    int diag   = memo[row + 1][col + 1];
                    int bottom = memo[row + 1][col];
                    int left   = memo[row][col + 1];

                    memo[row][col] = Math.min(diag, bottom);
                    memo[row][col] = Math.min(memo[row][col], left);
                    memo[row][col] += 1;

                    squareSide = Math.max(squareSide, memo[row][col]);
                }

        return squareSide * squareSide;
    }

}
~~~
