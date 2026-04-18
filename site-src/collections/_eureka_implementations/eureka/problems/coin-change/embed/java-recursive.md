---
problem_slug: coin-change
problem_title: Coin Change
problem_source_url: https://leetcode.com/problems/coin-change
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Coin Change · Java Recursive
description: Coin Change solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/recursive/CoinChange.java
code_language: java
detail_url: "/eureka/problems/coin-change/#java-recursive"
embed_url: "/eureka/problems/coin-change/embed/java-recursive/"
project_slug: eureka
---

~~~java
package array.recursive;

public class CoinChange {

    public int coinChange(int[] coins, int amount) {
        int coinChange = dfs(coins, amount, new Integer[amount + 1]);
        return coinChange == Integer.MAX_VALUE ? -1 : coinChange;
    }

    private int dfs(int[] coins, int amount, Integer[] memo) {
        if (amount == 0)
            return 0;

        if (memo[amount] != null)
            return memo[amount];

        int minCoinChange = Integer.MAX_VALUE;
        for (var coin : coins) {
            if (amount - coin < 0) continue;
            int coinChange = dfs(coins, amount - coin, memo);
            if (coinChange == Integer.MAX_VALUE) continue;
            minCoinChange = Math.min(minCoinChange, coinChange + 1);
        }

        return memo[amount] = minCoinChange;
    }

}
~~~
