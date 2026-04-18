---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: MissingTwo.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/MissingTwo.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/MissingTwo.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/MissingTwo.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/MissingTwo.java
description: MissingTwo.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.stream.IntStream;

public class MissingTwo {

    private static int[] missingTwo(int[] nums) {

        int targetN         = nums.length + 2;
        int actualTargetSum = IntStream.of(nums).sum();
        int targetDiff      = nSum(targetN) - actualTargetSum;

        int offset          = targetDiff / 2;
        int actualOffsetSum = IntStream.of(nums).filter(num -> num <= offset).sum();
        int offsetDiff      = nSum(offset) - actualOffsetSum;

        return new int[] { offsetDiff, targetDiff - offsetDiff };
    }

    private static int nSum(int n) {
        return n * (n + 1) / 2;
    }

}
~~~
