---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: FlipBitToWin.java
tree_path: src/main/java/cracking_the_coding_interview/ch_05/FlipBitToWin.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/FlipBitToWin.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/FlipBitToWin.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_05/FlipBitToWin.java
description: FlipBitToWin.java notes
---

~~~java
package cracking_the_coding_interview.ch_05;

public class FlipBitToWin {

    private static int flipBitToWin(int num) {

        int maxLength = 0, zeroPos = -1;
        for (int leftPtr = 0, rightPtr = 0; rightPtr < 32; rightPtr++) {
            if ((num & (1 << rightPtr)) == 0) {
                leftPtr = zeroPos + 1;
                zeroPos = rightPtr;
            }
            maxLength = Math.max(maxLength, rightPtr - leftPtr + 1);
        }

        return maxLength;
    }

}
~~~
