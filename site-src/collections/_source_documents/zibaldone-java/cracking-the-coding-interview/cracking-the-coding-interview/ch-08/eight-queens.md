---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: EightQueens.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/EightQueens.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/EightQueens.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/EightQueens.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_08
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/EightQueens.java
description: EightQueens.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class EightQueens {

    // n = 8
    private static List<String> solveNQueens(int n) {
        char[][] board      = new char[n][n];
        List<String> result = new ArrayList<>();
        Arrays.stream(board).forEach(row -> Arrays.fill(row, '.'));
        helper(board, 0, 0, 0, 0, result);
        return result;
    }

    private static void helper(char[][] board, int row, int cols, int diagonals, int antiDiagonals, List<String> result) {

        int n = board.length;

        if (row == n) {
            var boardState = buildBoard(board);
            result.add(boardState);
            return;
        }

        for (int col = 0; col < n; col++) {
            int colMask = 1 << col, diagonalMask = 1 << (row + col), antiDiagonalMask = 1 << (row - col + n);
            if ((cols & colMask) + (diagonals & diagonalMask) + (antiDiagonals & antiDiagonalMask) > 0) continue;

            board[row][col] = 'Q';
            helper(board, row + 1, cols | colMask, diagonals | diagonalMask, antiDiagonals | antiDiagonalMask, result);
            board[row][col] = '.';
        }

    }

    private static String buildBoard(char[][] board) {
        StringBuilder sb = new StringBuilder();
        for (int row = 0; row < board.length; row++) {
            for (int col = 0; col < board[row].length; col++)
                sb.append(board[row][col]).append(" ");
            sb.append('\n');
        }

        return sb.toString();
    }

}
~~~
