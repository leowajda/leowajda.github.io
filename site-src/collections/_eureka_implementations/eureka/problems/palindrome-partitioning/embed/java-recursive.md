---
problem_slug: palindrome-partitioning
problem_title: Palindrome Partitioning
problem_source_url: https://leetcode.com/problems/palindrome-partitioning
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Palindrome Partitioning · Java Recursive
description: Palindrome Partitioning solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/string/recursive/PalindromePartitioning.java
code_language: java
detail_url: "/eureka/problems/palindrome-partitioning/#java-recursive"
embed_url: "/eureka/problems/palindrome-partitioning/embed/java-recursive/"
project_slug: eureka
---

~~~java
package string.recursive;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class PalindromePartitioning {

    public List<List<String>> partition(String s) {
        List<List<String>> partitions = new ArrayList<>();
        boolean[][] memo = isPalindrome(s);
        backtrack(s, 0, memo, new ArrayDeque<>(), partitions);
        return partitions;
    }

    private void backtrack(String s, int start, boolean[][] memo, Deque<String> deque, List<List<String>> partitions) {

        if (start >= s.length()) {
            var partition = new ArrayList<>(deque);
            partitions.add(partition);
            return;
        }

        for (int end = start; end < s.length(); end++) {
            if (!memo[start][end]) continue;

            var substring = s.substring(start, end + 1);
            deque.addLast(substring);
            backtrack(s, end + 1, memo, deque, partitions);
            deque.removeLast();
        }

    }

    private boolean[][] isPalindrome(String s) {

        int n = s.length();
        boolean[][] memo = new boolean[n][n];

        for (int end = 0; end < n; end++)
            for (int start = 0; start <= end; start++)
                if (s.charAt(start) == s.charAt(end) && (end - start < 2 || memo[start + 1][end - 1]))
                    memo[start][end] = true;

        return memo;
    }

}
~~~
