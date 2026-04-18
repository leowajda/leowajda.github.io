---
problem_slug: predict-the-winner
problem_title: Predict the Winner
problem_source_url: https://leetcode.com/problems/predict-the-winner
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Predict the Winner · Java Recursive
description: Predict the Winner solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/recursive/PredictTheWinner.java
code_language: java
detail_url: "/eureka/problems/predict-the-winner/#java-recursive"
embed_url: "/eureka/problems/predict-the-winner/embed/java-recursive/"
project_slug: eureka
---

~~~java
package array.recursive;

import java.util.Arrays;
import java.util.stream.IntStream;

public class PredictTheWinner {

    public boolean predictTheWinner(int[] nums) {
        int n           = nums.length;
        int[] prefixSum = new int[n + 1];
        int[][] memo    = new int[n][n];

        IntStream.rangeClosed(1, n).forEach(i -> prefixSum[i] = prefixSum[i - 1] + nums[i - 1]);
        IntStream.range(0, n).forEach(row -> Arrays.fill(memo[row], Integer.MIN_VALUE));

        int max = dfs(nums, prefixSum, memo, 0, nums.length - 1);
        return max >= prefixSum[n] - max;
    }

    private int dfs(int[] nums, int[] prefixSum, int[][] memo, int left, int right) {
        if (memo[left][right] != Integer.MIN_VALUE)
            return memo[left][right];

        if (left == right)
            return memo[left][right] = nums[left];

        int sum       = prefixSum[right + 1] - prefixSum[left];
        int leftMove  = dfs(nums, prefixSum, memo, left + 1, right);
        int rightMove = dfs(nums, prefixSum, memo, left, right - 1);

        return memo[left][right] = Math.max(sum - leftMove, sum - rightMove);
    }

}
~~~
