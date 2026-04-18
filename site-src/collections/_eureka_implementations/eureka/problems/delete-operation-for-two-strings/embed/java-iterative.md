---
problem_slug: delete-operation-for-two-strings
problem_title: Delete Operation for Two Strings
problem_source_url: https://leetcode.com/problems/delete-operation-for-two-strings
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Delete Operation for Two Strings · Java Iterative
description: Delete Operation for Two Strings solution in Java using the iterative
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/string/iterative/DeleteOperationForTwoStrings.java
code_language: java
detail_url: "/eureka/problems/delete-operation-for-two-strings/#java-iterative"
embed_url: "/eureka/problems/delete-operation-for-two-strings/embed/java-iterative/"
project_slug: eureka
---

~~~java
package string.iterative;

import java.util.stream.IntStream;

public class DeleteOperationForTwoStrings {

    public int minDistance(String a, String b) {

        int[][] memo = new int[a.length() + 1][b.length() + 1];

        IntStream.rangeClosed(0, b.length()).forEach(col -> memo[0][col] = col);
        IntStream.rangeClosed(0, a.length()).forEach(row -> memo[row][0] = row);

        for (int aPtr = 1; aPtr <= a.length(); aPtr++)
            for (int bPtr = 1; bPtr <= b.length(); bPtr++) {
                char aCh = a.charAt(aPtr - 1);
                char bCh = b.charAt(bPtr - 1);

                memo[aPtr][bPtr] = aCh == bCh ? memo[aPtr - 1][bPtr - 1] : Math.min(memo[aPtr - 1][bPtr] + 1, memo[aPtr][bPtr - 1] + 1);
            }

        return memo[a.length()][b.length()];
    }

}
~~~
