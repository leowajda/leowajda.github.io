---
problem_slug: get-the-maximum-score
problem_title: Get the Maximum Score
problem_source_url: https://leetcode.com/problems/get-the-maximum-score
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Get the Maximum Score · Java Iterative
description: Get the Maximum Score solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/GetTheMaximumScore.java
code_language: java
detail_url: "/eureka/problems/get-the-maximum-score/#java-iterative"
embed_url: "/eureka/problems/get-the-maximum-score/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

public class GetTheMaximumScore {

    private static final int MODULO = 1_000_000_007;

    public int maxSum(int[] a, int[] b) {

        int aPtr    = 0;
        int bPtr    = 0;

        long bSum   = 0;
        long aSum   = 0;
        long maxSum = 0;

        while (aPtr < a.length && bPtr < b.length) {

            if (a[aPtr] == b[bPtr]) {
                maxSum += Math.max(aSum, bSum) + a[aPtr];

                aSum = bSum = 0;
                aPtr++;
                bPtr++;
                continue;
            }

            if (a[aPtr] < b[bPtr]) aSum += a[aPtr++];
            else                   bSum += b[bPtr++];
        }

        while (aPtr < a.length) aSum += a[aPtr++];
        while (bPtr < b.length) bSum += b[bPtr++];

        return (int) ((maxSum + Math.max(aSum, bSum)) % MODULO);
    }

}
~~~
