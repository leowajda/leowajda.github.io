---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: MajorityElement.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/MajorityElement.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/MajorityElement.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/MajorityElement.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/MajorityElement.java
description: MajorityElement.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

import java.util.stream.IntStream;

public class MajorityElement {

    private static int majorityElement(int[] nums) {
        int majorityNum = count(nums);
        int count = (int) IntStream.of(nums).filter(num -> num == majorityNum).count();
        return count > (nums.length / 2) ? majorityNum : -1;
    }

    private static int count(int[] nums) {

        int majorityNum = 0, counter = 0;
        for (var num : nums) {
            if (counter == 0)       majorityNum = num;
            counter += (num == majorityNum) ? 1 : -1;
        }

        return majorityNum;
    }

}
~~~
