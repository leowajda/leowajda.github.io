---
problem_slug: sqrtx
problem_title: Sqrt(x)
problem_source_url: https://leetcode.com/problems/sqrtx
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Sqrt(x) · Java Iterative
description: Sqrt(x) solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/math/iterative/SqrtX.java
code_language: java
detail_url: "/eureka/problems/sqrtx/#java-iterative"
embed_url: "/eureka/problems/sqrtx/embed/java-iterative/"
project_slug: eureka
---

~~~java
package math.iterative;

public class SqrtX {

    public int mySqrt(int x) {

        long start = 0, end = x;
        long sqrt = -1;

        while (start <= end) {

            long mid = start + (end - start) / 2;

            if (mid * mid == x) return (int) mid;

            if (mid * mid < x) {
                sqrt = mid;
                start = mid + 1;
            } else
                end = mid - 1;

        }

        return (int) sqrt;
    }

}
~~~
