---
problem_slug: letter-combinations-of-a-phone-number
problem_title: Letter Combinations of a Phone Number
problem_source_url: https://leetcode.com/problems/letter-combinations-of-a-phone-number
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Letter Combinations of a Phone Number · Java Recursive
description: Letter Combinations of a Phone Number solution in Java using the recursive
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/string/recursive/LetterCombinationsOfAPhoneNumber.java
code_language: java
detail_url: "/eureka/problems/letter-combinations-of-a-phone-number/#java-recursive"
embed_url: "/eureka/problems/letter-combinations-of-a-phone-number/embed/java-recursive/"
project_slug: eureka
---

~~~java
package string.recursive;

import java.util.*;

public class LetterCombinationsOfAPhoneNumber {

    private static final Map<Character, List<String>> PHONE = Map.of(
            '2', List.of("a", "b", "c"),
            '3', List.of("d", "e", "f"),
            '4', List.of("g", "h", "i"),
            '5', List.of("j", "k", "l"),
            '6', List.of("m", "n", "o"),
            '7', List.of("p", "q", "r", "s"),
            '8', List.of("t", "u", "v"),
            '9', List.of("w", "x", "y", "z")
    );

    public List<String> letterCombinations(String digits) {
        List<String> letterCombinations = new ArrayList<>();
        backtrack(digits, 0, letterCombinations, new ArrayDeque<>());
        return digits.isEmpty() ? Collections.emptyList() : letterCombinations;
    }

    private void backtrack(String digits, int idx, List<String> letterCombinations, Deque<String> stack) {

        if (idx == digits.length()) {
            var letterCombination = String.join("", stack);
            letterCombinations.add(letterCombination);
            return;
        }

        char digit = digits.charAt(idx);
        for (var letter : PHONE.get(digit)) {
            stack.addLast(letter);
            backtrack(digits, idx + 1, letterCombinations, stack);
            stack.removeLast();
        }

    }

}
~~~
