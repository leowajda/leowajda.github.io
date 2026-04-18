---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: BestLine.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/BestLine.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/BestLine.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/BestLine.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/BestLine.java
description: BestLine.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

import java.util.*;

public class BestLine {

    private static int bestLine(int[][] points) {
        int maxPoints = 1;
        int n = points.length;

        Map<Double, Integer> slopeCounter = new HashMap<>(n);
        for (int i = 0; i < n; i++) {
            int x1 = points[i][0];
            int y1 = points[i][1];

            slopeCounter.clear();
            for (int j = 0; j < n; j++) {
                if (i == j) continue;
                int x2 = points[j][0];
                int y2 = points[j][1];

                double slope = (x1 == x2) ? Integer.MAX_VALUE : (y2 - y1) * 1.0 / (x2 - x1);
                int counter = slopeCounter.merge(slope, 1, Integer::sum);
                maxPoints = Math.max(maxPoints, counter + 1);
            }
        }

        return maxPoints;
    }

}
~~~
