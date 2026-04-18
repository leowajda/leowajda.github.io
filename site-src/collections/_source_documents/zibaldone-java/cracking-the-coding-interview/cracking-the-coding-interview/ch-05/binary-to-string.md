---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: BinaryToString.java
tree_path: src/main/java/cracking_the_coding_interview/ch_05/BinaryToString.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/BinaryToString.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/BinaryToString.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_05
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_05/BinaryToString.java
description: BinaryToString.java notes
---

~~~java
package cracking_the_coding_interview.ch_05;

public class BinaryToString {

    private static String binaryToString(double num) {
        if (num <= 0 || num >= 1)
            return "ERROR";

        StringBuilder sb = new StringBuilder();
        double offset = 0.5;

        while (num > 0) {

            if (sb.length() >= 32)
                return "ERROR";

            if (num >= offset) {
                num -= offset;
                sb.append(1);
            } else
                sb.append(0);

            offset /= 2;
        }

        return sb.toString();
    }

}
~~~
