---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: PeaksAndValleys.java
tree_path: src/main/java/cracking_the_coding_interview/ch_10/PeaksAndValleys.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/PeaksAndValleys.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/PeaksAndValleys.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_10/PeaksAndValleys.java
description: PeaksAndValleys.java notes
---

~~~java
package cracking_the_coding_interview.ch_10;

import java.util.Arrays;

public class PeaksAndValleys {

    // will correctly handle cases with duplicates like [5, 5, 5, 5, 9, 9, 9], the solution from the book is wrong.
    private static void peaksAndValleys(int[] nums) {
        Arrays.sort(nums);
        int leftPtr = 1, rightPtr = nums.length - 1;

        while (leftPtr <= rightPtr) {

            int tmp = nums[leftPtr];
            nums[leftPtr] = nums[rightPtr];
            nums[rightPtr] = tmp;

            leftPtr  += 2;
            rightPtr -= 2;
        }

    }

}
~~~
