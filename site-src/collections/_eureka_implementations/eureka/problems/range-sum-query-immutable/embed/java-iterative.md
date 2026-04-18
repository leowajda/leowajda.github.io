---
problem_slug: range-sum-query-immutable
problem_title: Range Sum Query - Immutable
problem_source_url: https://leetcode.com/problems/range-sum-query-immutable
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Range Sum Query - Immutable · Java Iterative
description: Range Sum Query - Immutable solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/RangeSumQueryImmutable.java
code_language: java
detail_url: "/eureka/problems/range-sum-query-immutable/#java-iterative"
embed_url: "/eureka/problems/range-sum-query-immutable/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.Arrays;

public class RangeSumQueryImmutable {

    private final int[] prefixSum;

    public RangeSumQueryImmutable(int[] nums) {
        this.prefixSum = Arrays.copyOf(nums, nums.length);
        for (int i = 1; i < nums.length; i++)
            prefixSum[i] += prefixSum[i - 1];
    }

    public int sumRange(int left, int right) {
        return left == 0 ? prefixSum[right] : prefixSum[right] - prefixSum[left - 1];
    }

}
~~~
