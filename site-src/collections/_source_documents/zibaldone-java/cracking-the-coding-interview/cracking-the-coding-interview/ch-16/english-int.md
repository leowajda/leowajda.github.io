---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: EnglishInt.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/EnglishInt.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/EnglishInt.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/EnglishInt.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_16
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/EnglishInt.java
description: EnglishInt.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

import java.util.ArrayDeque;
import java.util.Deque;

public class EnglishInt {

    private static final String[] ZERO_TO_NINETEEN = {
            "Zero",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen"
    };

    private static final String[] TENS = {
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety"
    };

    private static final String[] BIGS = {
            "",
            "Thousand",
            "Million",
            "Billion"
    };

    private static String convert(int num) {
        if (num < 0)    return "Negative " + convert(-num);
        if (num == 0)   return ZERO_TO_NINETEEN[0];

        Deque<String> stack = new ArrayDeque<>();
        int counter = 0;

        while (num > 0) {
            if (num % 1_000 != 0) {
                 var chunk = convertChunk(num % 1_000);
                 stack.addLast(BIGS[counter]);
                 stack.addLast(chunk);
            }
            num /= 1_000;
            counter++;
        }

        return joinReverse(stack);
    }

    private static String joinReverse(Deque<String> stack) {
        StringBuilder sb = new StringBuilder();
        while (!stack.isEmpty()) {
            var s = stack.removeLast();
            if (!s.isBlank()) sb.append(s).append(" ");
        }
        return sb.toString();
    }

    private static String convertChunk(int num) {
        Deque<String> stack = new ArrayDeque<>();
        if (num >= 100) {
            stack.push(ZERO_TO_NINETEEN[num / 100]);
            stack.push("Hundred");
            num %= 100;
        }

        if (num >= 10 && num <= 19) stack.push(ZERO_TO_NINETEEN[num]);

        if (num >= 20) {
            stack.push(TENS[num / 10]);
            num %= 10;
        }

        if (num >= 1 && num <= 9) stack.push(ZERO_TO_NINETEEN[num]);
        return joinReverse(stack);
    }

}
~~~
