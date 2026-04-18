---
problem_slug: flood-fill
problem_title: Flood Fill
problem_source_url: https://leetcode.com/problems/flood-fill
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Flood Fill · Java Recursive
description: Flood Fill solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/graph/recursive/FloodFill.java
code_language: java
detail_url: "/eureka/problems/flood-fill/#java-recursive"
embed_url: "/eureka/problems/flood-fill/embed/java-recursive/"
project_slug: eureka
---

~~~java
package graph.recursive;

public class FloodFill {

    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        if (image[sr][sc] == color) return image;
        dfs(image, sr, sc, image[sr][sc], color);
        return image;
    }

    private void dfs(int[][] image, int row, int col, int from, int to) {
        if (row < 0 || row >= image.length || col < 0 || col >= image[0].length || image[row][col] != from) return;
        image[row][col] = to;
        dfs(image, row + 1, col, from, to);
        dfs(image, row - 1, col, from, to);
        dfs(image, row, col + 1, from, to);
        dfs(image, row, col - 1, from, to);
    }

}
~~~
