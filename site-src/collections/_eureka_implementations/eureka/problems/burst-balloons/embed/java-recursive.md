---
problem_slug: burst-balloons
problem_title: Burst Balloons
problem_source_url: https://leetcode.com/problems/burst-balloons
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Burst Balloons · Java Recursive
description: Burst Balloons solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/recursive/BurstBalloons.java
code_language: java
detail_url: "/eureka/problems/burst-balloons/#java-recursive"
embed_url: "/eureka/problems/burst-balloons/embed/java-recursive/"
project_slug: eureka
---

~~~java
package array.recursive;

public class BurstBalloons {

    public int maxCoins(int[] nums) {
        int n    = nums.length;
        var memo = new int[n][n];
        return dfs(nums, memo, 0, n - 1);
    }

    private int dfs(int[] nums, int[][] memo, int left, int right) {
        if (left > right)
            return 0;

        if (memo[left][right] != 0)
            return memo[left][right];

        for (int i = left; i <= right; i++) {
            int currBalloon  = nums[i];
            int leftBalloon  = left - 1 == -1 ? 1 : nums[left - 1];
            int rightBalloon = right + 1 == nums.length ? 1 : nums[right + 1];

            memo[left][right] = Math.max(
                    memo[left][right],
                    dfs(nums, memo, left, i - 1) + (leftBalloon * currBalloon * rightBalloon) + dfs(nums, memo, i + 1, right)
            );
        }

        return memo[left][right];
    }

}
~~~
