---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: URLify.java
tree_path: src/main/java/cracking_the_coding_interview/ch_01/URLify.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/URLify.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/URLify.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_01/URLify.java
description: URLify.java notes
---

~~~java
package cracking_the_coding_interview.ch_01;

public class URLify {

    private static String urlIfy(String s, int trueLength) {
        char[] chars = s.toCharArray();

        for (int leftPtr = trueLength - 1, rightPtr = s.length() - 1; leftPtr >= 0; leftPtr--) {
            char ch = s.charAt(leftPtr);

            if (Character.isLetterOrDigit(ch)) {
                chars[rightPtr] = ch;
                rightPtr--;
                continue;
            }

            chars[rightPtr]     = '0';
            chars[rightPtr - 1] = '2';
            chars[rightPtr - 2] = '%';
            rightPtr -= 3;
        }

        return new String(chars);
    }

}
~~~
