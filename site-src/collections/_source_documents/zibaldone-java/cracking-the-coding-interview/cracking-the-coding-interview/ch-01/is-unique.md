---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: IsUnique.java
tree_path: src/main/java/cracking_the_coding_interview/ch_01/IsUnique.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/IsUnique.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_01/IsUnique.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_01/IsUnique.java
description: IsUnique.java notes
---

~~~java
package cracking_the_coding_interview.ch_01;

public class IsUnique {

    private static boolean hasAllUniqueCharacters(String s) {

        int bitMask = 0b0;
        // assumes ASCII in range 'a' - 'z'
        for (int i = 0; i < s.length(); i++) {
            int val = s.charAt(i) - 'a';
            int marker = (1 << val);
            if ((bitMask & marker) != 0)
                return false;
            bitMask |= marker;
        }

        return true;
    }

}
~~~
