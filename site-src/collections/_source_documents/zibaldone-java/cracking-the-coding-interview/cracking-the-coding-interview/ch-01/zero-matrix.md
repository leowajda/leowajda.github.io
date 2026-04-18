---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: ZeroMatrix.java
tree_path: src/main/java/cracking_the_coding_interview/ch_01/ZeroMatrix.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/ZeroMatrix.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/ZeroMatrix.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_01
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_01/ZeroMatrix.java
description: ZeroMatrix.java notes
---

~~~java
package cracking_the_coding_interview.ch_01;

import java.util.Arrays;

public class ZeroMatrix {

    private static void zeroMatrix(int[][] matrix) {

        boolean isFirstRowZero = false, isFirstColZero = false;
        int rows = matrix.length, cols = matrix[0].length;

        for (int row = 0; row < rows; row++)
            for (int col = 0; col < cols; col++)
                if (matrix[row][col] == 0) {
                    if (row == 0) isFirstRowZero = true;
                    if (col == 0) isFirstColZero = true;

                    matrix[row][0] = 0;
                    matrix[0][col] = 0;
                }

        for (int row = 1; row < rows; row++)
            if (matrix[row][0] == 0)
                Arrays.fill(matrix[row], 0);

        for (int col = 1; col < cols; col++)
            if (matrix[0][col] == 0)
                for (int row = 1; row < rows; row++) matrix[row][col] = 0;

        if (isFirstRowZero) Arrays.fill(matrix[0], 0);
        if (isFirstColZero) for (int row = 1; row < rows; row++) matrix[row][0] = 0;
    }

}
~~~
