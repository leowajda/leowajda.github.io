---
problem_slug: decode-ways
problem_title: Decode Ways
problem_source_url: https://leetcode.com/problems/decode-ways
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Decode Ways · Java Recursive
description: Decode Ways solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/string/recursive/DecodeWays.java
code_language: java
detail_url: "/eureka/problems/decode-ways/#java-recursive"
embed_url: "/eureka/problems/decode-ways/embed/java-recursive/"
project_slug: eureka
---

~~~java
package string.recursive;

import java.util.Set;
import java.util.HashSet;
import java.util.stream.IntStream;

import static java.util.stream.Collectors.toCollection;

public class DecodeWays {

    private static final Set<String> VALID_NUMBERS = IntStream.rangeClosed(1, 26)
            .mapToObj(Integer::toString)
            .collect(toCollection(HashSet::new));

    public int numDecodings(String s) {
        return dfs(s, 0, new Integer[s.length()]);
    }

    private int dfs(String s, int start, Integer[] memo) {

        if (start >= s.length())
            return 1;

        if (memo[start] != null)
            return memo[start];

        int ways = 0;

        var firstDigit = String.valueOf(s.charAt(start));
        if (VALID_NUMBERS.contains(firstDigit))
            ways += dfs(s, start + 1, memo);

        if (start + 2 > s.length())
            return memo[start] = ways;

        var secondDigit = String.valueOf(s.charAt(start + 1));
        if (VALID_NUMBERS.contains(firstDigit + secondDigit))
            ways += dfs(s, start + 2, memo);

        return memo[start] = ways;
    }

}
~~~
