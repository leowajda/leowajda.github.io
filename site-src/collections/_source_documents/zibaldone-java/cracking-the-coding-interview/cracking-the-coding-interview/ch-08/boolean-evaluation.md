---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: BooleanEvaluation.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/BooleanEvaluation.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/BooleanEvaluation.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/BooleanEvaluation.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/BooleanEvaluation.java
description: BooleanEvaluation.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

import java.util.HashMap;
import java.util.Map;

public class BooleanEvaluation {

    private static int eval(String exp, boolean result) {
        return helper(exp, result, new HashMap<>());
    }

    private static int helper(String exp, boolean result, Map<String, Integer> memo) {

        if (exp.isEmpty())                  return 0;
        if (exp.length() == 1)              return (result ? "1" : "0").equals(exp) ? 1 : 0;
        if (memo.containsKey(exp + result)) return memo.get(exp + result);

        int n = exp.length(), ways = 0;
        for (int i = 1; i < n; i += 2) {

            String leftExp  = exp.substring(0, i);
            int leftTrue    = helper(leftExp, true, memo);
            int leftFalse   = helper(leftExp, false, memo);

            String rightExp = exp.substring(i + 1, n);
            int rightTrue   = helper(rightExp, true, memo);
            int rightFalse  = helper(rightExp, false, memo);

            int totCount  = (leftTrue + leftFalse) * (rightTrue + rightFalse);
            int trueCount = 0;

            char op = exp.charAt(i);
            if (op == '&') trueCount = (leftTrue * rightTrue);
            if (op == '^') trueCount = (leftTrue * rightFalse) + (rightTrue * leftFalse);
            if (op == '|') trueCount = (leftTrue * rightTrue) + (leftTrue * rightFalse) + (rightTrue * leftFalse);

            ways += result ? trueCount : totCount - trueCount;
        }

        return memo.put(exp + result, ways);
    }

}
~~~
