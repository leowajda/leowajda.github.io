---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: SubSort.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/SubSort.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/SubSort.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/SubSort.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_16
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/SubSort.java
description: SubSort.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

public class SubSort {

    private static int[] subSort(int[] nums) {

        int max = Integer.MIN_VALUE, min = Integer.MAX_VALUE;
        int leftPtr = -1, rightPtr = -1;
        int n = nums.length;

        for (int i = 0; i < n; i++)
            if (nums[i] >= max) max = nums[i];
            else                rightPtr = i;

        for (int i = n - 1; i >= 0; i--)
            if (nums[i] <= min) min = nums[i];
            else                leftPtr = i;

        return new int[] { leftPtr, rightPtr };
    }

}
~~~
