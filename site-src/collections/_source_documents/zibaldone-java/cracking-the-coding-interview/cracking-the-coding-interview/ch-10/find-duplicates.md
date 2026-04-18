---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: FindDuplicates.java
tree_path: src/main/java/cracking_the_coding_interview/ch_10/FindDuplicates.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/FindDuplicates.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/FindDuplicates.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_10/FindDuplicates.java
description: FindDuplicates.java notes
---

~~~java
package cracking_the_coding_interview.ch_10;

public class FindDuplicates {

    private static void findDuplicates(int[] nums) {

        var bitSet = new BitSet(32_000);
        for (var num : nums)
            if (bitSet.get(num)) System.out.println(num);
            else                 bitSet.set(num);
    }

    private static class BitSet {
        private static final int BASE = 32;
        private final int[] bitSet;

        public BitSet(int size) {
            this.bitSet = new int[(size / BASE) + 1];
        }

        public boolean get(int num) {
            int idx    = (num / BASE);
            int bitIdx = (num % BASE);
            return (bitSet[idx] & (1 << bitIdx)) != 0;
        }

        public void set(int num) {
            int idx    = (num / BASE);
            int bitIdx = (num % BASE);
            bitSet[idx] |= (1 << bitIdx);
        }

    }

}
~~~
