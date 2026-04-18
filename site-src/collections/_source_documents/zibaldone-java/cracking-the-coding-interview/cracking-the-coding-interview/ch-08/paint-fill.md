---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: PaintFill.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/PaintFill.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/PaintFill.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/PaintFill.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/PaintFill.java
description: PaintFill.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

public class PaintFill {

    // assume monochrome screen
    private static void paint(int[][] screen, int row, int col, int color) {
        helper(screen, row, col, screen[row][col], color);
    }

    private static void helper(int[][] screen, int row, int col, int from, int to) {

        if (row < 0 || row >= screen.length || col < 0 || col >= screen[0].length) return;
        if (screen[row][col] != from)                                              return;
        screen[row][col] = to;

        helper(screen, row - 1, col, from, to);
        helper(screen, row + 1, col, from, to);
        helper(screen, row, col - 1, from, to);
        helper(screen, row, col + 1, from, to);
    }

}
~~~
