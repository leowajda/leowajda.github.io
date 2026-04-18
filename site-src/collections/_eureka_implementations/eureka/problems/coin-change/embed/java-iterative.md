---
problem_slug: coin-change
problem_title: Coin Change
problem_source_url: https://leetcode.com/problems/coin-change
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Coin Change · Java Iterative
description: Coin Change solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/CoinChange.java
code_language: java
detail_url: "/eureka/problems/coin-change/#java-iterative"
embed_url: "/eureka/problems/coin-change/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.Arrays;

public class CoinChange {

    public int coinChange(int[] coins, int amount) {

        int[] memo = new int[amount + 1];
        Arrays.fill(memo, Integer.MAX_VALUE);
        memo[0] = 0;

        for (int i = 1; i < memo.length; i++)
            for (var coin : coins) {
                if (i - coin < 0 || memo[i - coin] == Integer.MAX_VALUE) continue;
                memo[i] = Math.min(memo[i], memo[i - coin] + 1);
            }

        return memo[amount] == Integer.MAX_VALUE ? -1 : memo[amount];
    }

}
~~~
