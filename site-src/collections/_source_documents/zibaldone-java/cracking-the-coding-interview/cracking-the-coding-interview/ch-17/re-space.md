---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: ReSpace.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/ReSpace.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/ReSpace.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/ReSpace.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_17
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/ReSpace.java
description: ReSpace.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ReSpace {

    private static int reSpace(String document, List<String> words) {

        Set<String> dictionary = new HashSet<>(words);
        int n = document.length();
        int[] memo = new int[n + 1];

        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++) {
                String substring = document.substring(i, j + 1);
                int m = substring.length();
                memo[i] = Math.max(memo[i], memo[j + 1] + (dictionary.contains(substring) ? m : 0));
            }

        return n - memo[0];
    }

}
~~~
