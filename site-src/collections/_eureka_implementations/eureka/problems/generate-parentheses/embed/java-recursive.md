---
problem_slug: generate-parentheses
problem_title: Generate Parentheses
problem_source_url: https://leetcode.com/problems/generate-parentheses
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Generate Parentheses · Java Recursive
description: Generate Parentheses solution in Java using the recursive approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/string/recursive/GenerateParentheses.java
code_language: java
detail_url: "/eureka/problems/generate-parentheses/#java-recursive"
embed_url: "/eureka/problems/generate-parentheses/embed/java-recursive/"
project_slug: eureka
---

~~~java
package string.recursive;

import java.util.ArrayList;
import java.util.List;

public class GenerateParentheses {

    public List<String> generateParenthesis(int n) {
        List<String> parenthesis = new ArrayList<>();
        backtrack(n, n, new StringBuilder(), parenthesis);
        return parenthesis;
    }

    private void backtrack(int open, int close, StringBuilder sb, List<String> parenthesis) {

        if (open == 0 && close == 0) {
            parenthesis.add(sb.toString());
            return;
        }

        int n = sb.length();
        if (open > 0) {
            sb.append("(");
            backtrack(open - 1, close, sb, parenthesis);
            sb.deleteCharAt(n);
        }

        if (close > open) {
            sb.append(")");
            backtrack(open, close - 1, sb, parenthesis);
            sb.deleteCharAt(n);
        }

    }

}
~~~
