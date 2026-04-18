---
problem_slug: longest-common-subsequence
problem_title: Longest Common Subsequence
problem_source_url: https://leetcode.com/problems/longest-common-subsequence
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Longest Common Subsequence · Java Recursive
description: Longest Common Subsequence solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/string/recursive/LongestCommonSubsequence.java
code_language: java
detail_url: "/eureka/problems/longest-common-subsequence/#java-recursive"
embed_url: "/eureka/problems/longest-common-subsequence/embed/java-recursive/"
project_slug: eureka
---

~~~java
package string.recursive;

import java.util.Arrays;

public class LongestCommonSubsequence {

    public int longestCommonSubsequence(String a, String b) {
        int[][] memo = new int[a.length()][b.length()];
        Arrays.stream(memo).forEach(row -> Arrays.fill(row, Integer.MIN_VALUE));
        return dfs(a, b, memo, 0, 0);
    }

    private int dfs(String a, String b, int[][] memo, int ptrA, int ptrB) {
        if (ptrA == a.length() || ptrB == b.length())
            return 0;

        if (memo[ptrA][ptrB] != Integer.MIN_VALUE)
            return memo[ptrA][ptrB];

        if (a.charAt(ptrA) == b.charAt(ptrB))
            return memo[ptrA][ptrB] = dfs(a, b, memo, ptrA + 1, ptrB + 1) + 1;

        int subA = dfs(a, b, memo, ptrA + 1, ptrB);
        int subB = dfs(a, b, memo, ptrA, ptrB + 1);
        return memo[ptrA][ptrB] = Math.max(memo[ptrA][ptrB], Math.max(subA, subB));
    }

}
~~~
