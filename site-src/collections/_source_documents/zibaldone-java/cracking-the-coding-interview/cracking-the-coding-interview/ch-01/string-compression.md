---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: StringCompression.java
tree_path: src/main/java/cracking_the_coding_interview/ch_01/StringCompression.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/StringCompression.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/StringCompression.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_01
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_01/StringCompression.java
description: StringCompression.java notes
---

~~~java
package cracking_the_coding_interview.ch_01;

public class StringCompression {

    private static String compress(String s) {

        StringBuilder sb = new StringBuilder();
        int counter = 0;

        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            counter++;

            if (i + 1 == s.length() || s.charAt(i + 1) != ch) {
                sb.append(ch).append(counter);
                counter = 0;
            }
        }

        return (sb.length() < s.length()) ? sb.toString() : s;
    }

}
~~~
