---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: SortedMatrixSearch.java
tree_path: src/main/java/cracking_the_coding_interview/ch_10/SortedMatrixSearch.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/SortedMatrixSearch.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/SortedMatrixSearch.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_10
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_10/SortedMatrixSearch.java
description: SortedMatrixSearch.java notes
---

~~~java
package cracking_the_coding_interview.ch_10;

public class SortedMatrixSearch {

    private static boolean search(int[][] matrix, int target) {

        int rows = matrix.length, cols = matrix[0].length;
        int left = 0, right = rows * cols - 1;

        while (left <= right) {
            int middle    = left + (right - left) / 2;
            int middleVal = matrix[middle / cols][middle % cols];

            if (middleVal == target)
                return true;

            if (middleVal < target) left  = middle + 1;
            else                    right = middle - 1;
        }

        return false;
    }

}
~~~
