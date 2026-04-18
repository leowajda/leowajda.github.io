---
problem_slug: ugly-number-ii
problem_title: Ugly Number II
problem_source_url: https://leetcode.com/problems/ugly-number-ii
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Ugly Number II · Java Iterative
description: Ugly Number II solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/math/iterative/UglyNumberII.java
code_language: java
detail_url: "/eureka/problems/ugly-number-ii/#java-iterative"
embed_url: "/eureka/problems/ugly-number-ii/embed/java-iterative/"
project_slug: eureka
---

~~~java
package math.iterative;

public class UglyNumberII {

    public int nthUglyNumber(int n) {

        int[] uglyNums     = new int[n];
        int[] indices      = new int[]{ 0, 0, 0 };
        int[] primeFactors = new int[]{ 2, 3, 5 };

        uglyNums[0] = 1;
        for (int i = 1; i < n; i++) {

            int min = Integer.MAX_VALUE;
            for (int j = 0; j < primeFactors.length; j++)
                min = Math.min(min, primeFactors[j] * uglyNums[indices[j]]);

            for (int j = 0; j < indices.length; j++)
                if ((primeFactors[j] * uglyNums[indices[j]]) == min)
                    indices[j]++;

            uglyNums[i] = min;
        }

        return uglyNums[n - 1];
    }

}
~~~
