---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: PondSizes.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/PondSizes.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/PondSizes.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/PondSizes.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_16
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/PondSizes.java
description: PondSizes.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

import java.util.ArrayList;
import java.util.List;

public class PondSizes {

    private static final int WATER          = 0;
    private static final int VISITED        = -1;

    private static final int[][] DIRECTIONS = {
            { 0, 1 }, { 0, -1 },                        // vertical
            { 1, 0 }, { -1, 0 },                        // horizontal
            { 1, 1 }, { -1, -1 }, { -1, 1}, { 1, -1 }   // diagonal
    };


    private static List<Integer> pondSizes(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        List<Integer> pondSizes = new ArrayList<>();

        for (int row = 0; row < rows; row++)
            for (int col = 0; col < cols; col++)
                if (grid[row][col] == WATER) {
                    int pondSize = findPondSize(grid, row, col);
                    pondSizes.add(pondSize);
                }

        return pondSizes;
    }

    private static int findPondSize(int[][] grid, int row, int col) {
        int rows = grid.length, cols = grid[0].length;

        if (row < 0 || row >= rows || col < 0 || col >= cols) return 0;
        if (grid[row][col] != WATER)                          return 0;

        int pondSize = 1;
        grid[row][col] = VISITED;

        for (var direction : DIRECTIONS) {
            int rowOffset = direction[0], colOffset = direction[1];
            pondSize += findPondSize(grid, row + rowOffset, col + colOffset);
        }

        return pondSize;
    }

}
~~~
