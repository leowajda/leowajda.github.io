---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: MissingNumber.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/MissingNumber.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/MissingNumber.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/MissingNumber.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/MissingNumber.java
description: MissingNumber.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.Arrays;

public class MissingNumber {

    // book author presents an over-engineered solution because doesn't want to admit that integer size is in fact constant and not log(n).
    // also, the bit indexing requirement is complete bs...
    private static int missingNumber(int[] nums) {
        int sum = Arrays.stream(nums).sum();
        int n   = nums.length;
        return (n * (n + 1) / 2) - sum;
    }
}
~~~
