---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: NextNumber.java
tree_path: src/main/java/cracking_the_coding_interview/ch_05/NextNumber.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/NextNumber.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_05/NextNumber.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_05/NextNumber.java
description: NextNumber.java notes
---

~~~java
package cracking_the_coding_interview.ch_05;

public class NextNumber {

    private static int getNext(int num) {

        int numZeros = 0;
        int numCopy  = num;
        while (((numCopy & 1) == 0) && numCopy != 0) {
            numZeros++;
            numCopy >>= 1;
        }

        int numOnes = 0;
        while ((numCopy & 1) == 1) {
            numOnes++;
            numCopy >>= 1;
        }

        int pos = numZeros + numOnes; // rightmost non-trailing zero

        if (pos == 31 || pos == 0)
            return -1;

        num |= (1 << pos);
        num &= ~((1 << pos) - 1);
        num |= (1 << (numOnes - 1)) - 1;
        return num;
    }

    private static int getPrev(int num) {

        int numCopy = num;
        int numOnes = 0;
        while ((numCopy & 1) == 1) {
            numOnes++;
            numCopy >>= 1;
        }

        if (numCopy == 0) return -1;

        int numZeros = 0;
        while (((numCopy & 1) == 0) && numCopy != 0) {
            numZeros++;
            numCopy >>= 1;
        }

        int pos = numOnes + numZeros; // rightmost non-trailing one

        num &= ((~0) << (pos + 1));
        int mask = (1 << (numOnes + 1)) - 1;
        num |= mask << (numZeros - 1);
        return num;
    }

}
~~~
