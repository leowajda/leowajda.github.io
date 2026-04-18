---
problem_slug: longest-increasing-subsequence
problem_title: Longest Increasing Subsequence
problem_source_url: https://leetcode.com/problems/longest-increasing-subsequence
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Longest Increasing Subsequence · Java Iterative
description: Longest Increasing Subsequence solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/LongestIncreasingSubsequence.java
code_language: java
detail_url: "/eureka/problems/longest-increasing-subsequence/#java-iterative"
embed_url: "/eureka/problems/longest-increasing-subsequence/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.Arrays;

public class LongestIncreasingSubsequence {

    public int lengthOfLIS(int[] nums) {

        int n       = nums.length;
        int lis     = 0;
        int[] memo  = new int[n];
        Arrays.fill(memo, 1);

        for (int i = n - 1; i >= 0; i--) {
            for (int j = i + 1; j < n; j++)
                if (nums[i] < nums[j])
                    memo[i] = Math.max(memo[i], memo[j] + 1);

            lis = Math.max(lis, memo[i]);
        }


        return lis;
    }

}
~~~
