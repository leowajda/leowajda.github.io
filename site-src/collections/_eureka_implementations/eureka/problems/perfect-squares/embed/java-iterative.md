---
problem_slug: perfect-squares
problem_title: Perfect Squares
problem_source_url: https://leetcode.com/problems/perfect-squares
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Perfect Squares · Java Iterative
description: Perfect Squares solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/math/iterative/PerfectSquares.java
code_language: java
detail_url: "/eureka/problems/perfect-squares/#java-iterative"
embed_url: "/eureka/problems/perfect-squares/embed/java-iterative/"
project_slug: eureka
---

~~~java
package math.iterative;

import java.util.Arrays;

public class PerfectSquares {

    public int numSquares(int n) {

        int[] memo = new int[n + 1];
        Arrays.fill(memo, Integer.MAX_VALUE);
        memo[0] = 0;

        for (int i = 1; i * i <= n; i++) {
            int square = i * i;
            for (int j = square; j <= n; j++)
                memo[j] = Math.min(memo[j], memo[j - square] + 1);
        }

        return memo[n];
    }

}
~~~
