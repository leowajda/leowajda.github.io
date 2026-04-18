---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: Coins.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/Coins.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/Coins.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/Coins.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_08
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/Coins.java
description: Coins.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

import java.util.Arrays;
import java.util.List;

public class Coins {

    private static final List<Integer> COINS = List.of(25, 10, 5, 1);

    private static int coins(int n) {

        int[] memo = new int[n + 1];
        Arrays.fill(memo, Integer.MAX_VALUE);
        memo[0] = 0;

        for (int i = 1; i <= n; i++)
            for (var coin : COINS) {
                if (i - coin < 0 || memo[i - coin] == Integer.MAX_VALUE) continue;
                memo[i] = Math.min(memo[i], memo[i - coin] + 1);
            }
        
        return memo[n] == Integer.MAX_VALUE ? -1 : memo[n];
    }

}
~~~
