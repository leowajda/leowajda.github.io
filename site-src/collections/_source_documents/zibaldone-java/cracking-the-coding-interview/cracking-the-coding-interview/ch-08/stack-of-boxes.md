---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: StackOfBoxes.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/StackOfBoxes.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/StackOfBoxes.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/StackOfBoxes.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/StackOfBoxes.java
description: StackOfBoxes.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public class StackOfBoxes {

    private static int stackOfBoxes(int[][] boxes) {

        int maxHeight = 0;
        int n = boxes.length;
        int[] memo = new int[n];

        Arrays.sort(boxes, (a, b) -> a[0] == b[0] ? b[1] - a[1] : a[0] - b[0]);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++)
                if (boxes[j][1] < boxes[i][1] && boxes[j][2] < boxes[i][2])
                    memo[i] = Math.max(memo[i], memo[j]);

            memo[i] += boxes[i][2];
            maxHeight = Math.max(maxHeight, memo[i]);
        }

        return maxHeight;
    }

}
~~~
