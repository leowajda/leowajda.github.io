---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: GroupAnagrams.java
tree_path: src/main/java/cracking_the_coding_interview/ch_10/GroupAnagrams.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/GroupAnagrams.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/GroupAnagrams.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_10
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_10/GroupAnagrams.java
description: GroupAnagrams.java notes
---

~~~java
package cracking_the_coding_interview.ch_10;

import java.util.*;

public class GroupAnagrams {

    private static void groupAnagrams(String[] anagrams) {
        Map<String, List<String>> map = new HashMap<>(anagrams.length);

        for (var anagram : anagrams) {
            var key   = sort(anagram);
            var value = map.computeIfAbsent(key, any -> new ArrayList<>());
            value.add(anagram);
        }

        int pos = 0;
        for (var entry : map.entrySet())
            for (var anagram : entry.getValue())
                anagrams[pos++] = anagram;
    }

    private static String sort(String s) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        return new String(chars);
    }

}
~~~
