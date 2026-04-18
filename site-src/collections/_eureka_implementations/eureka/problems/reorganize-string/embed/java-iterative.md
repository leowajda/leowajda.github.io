---
problem_slug: reorganize-string
problem_title: Reorganize String
problem_source_url: https://leetcode.com/problems/reorganize-string
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Reorganize String · Java Iterative
description: Reorganize String solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/string/iterative/ReorganizeString.java
code_language: java
detail_url: "/eureka/problems/reorganize-string/#java-iterative"
embed_url: "/eureka/problems/reorganize-string/embed/java-iterative/"
project_slug: eureka
---

~~~java
package string.iterative;

import java.util.Map;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.reducing;

public class ReorganizeString {

    public String reorganizeString(String s) {

        Map<Character, Integer> map = s.chars().mapToObj(i -> (char) i).collect(groupingBy(e -> e, reducing(0, e -> 1, Integer::sum)));
        var maxEntry                = map.entrySet().stream().max(Map.Entry.comparingByValue()).orElseThrow();
        int n                       = s.length();

        if (maxEntry.getValue() > (n + 1) / 2)
            return "";

        char[] chars = new char[n];
        int idx      = insertCharacter(chars, maxEntry.getKey(), map, 0);

        for (var entry : map.entrySet())
            idx = insertCharacter(chars, entry.getKey(), map, idx);

        return new String(chars);
    }

    private static int insertCharacter(char[] chars, char key, Map<Character, Integer> counter, int start) {
        int end = start;

        while (counter.merge(key, -1, Integer::sum) >= 0) {
            if (end >= chars.length) end = 1;
            chars[end] = key;
            end += 2;
        }

        return end;
    }


}
~~~
