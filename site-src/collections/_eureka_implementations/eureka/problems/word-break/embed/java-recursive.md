---
problem_slug: word-break
problem_title: Word Break
problem_source_url: https://leetcode.com/problems/word-break
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Word Break · Java Recursive
description: Word Break solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/string/recursive/WordBreak.java
code_language: java
detail_url: "/eureka/problems/word-break/#java-recursive"
embed_url: "/eureka/problems/word-break/embed/java-recursive/"
project_slug: eureka
---

~~~java
package string.recursive;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WordBreak {

    public boolean wordBreak(String s, List<String> wordDict) {
        return dfs(s, 0, new HashSet<>(wordDict), new Boolean[s.length()]);
    }

    private boolean dfs(String s, int start, Set<String> wordDict, Boolean[] memo) {

        if (start >= s.length())
            return true;

        if (memo[start] != null)
            return memo[start];

        for (int end = start; end < s.length(); end++) {
            var word = s.substring(start, end + 1);
            if (wordDict.contains(word) && dfs(s, end + 1, wordDict, memo))
                return memo[start] = true;
        }

        return memo[start] = false;
    }

}
~~~
