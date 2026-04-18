---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: FindMagicIndex.java
tree_path: src/main/java/cracking_the_coding_interview/ch_08/FindMagicIndex.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/FindMagicIndex.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_08/FindMagicIndex.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_08
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_08/FindMagicIndex.java
description: FindMagicIndex.java notes
---

~~~java
package cracking_the_coding_interview.ch_08;

public class FindMagicIndex {

    private static int findMagicIndex(int[] nums) {
        return helper(nums, 0, nums.length - 1);
    }

    private static int helper(int[] nums, int left, int right) {
        if (left > right) return -1;

        int middle = left + (right - left) / 2;
        if (nums[middle] == middle)
            return middle;

        int leftMagicIndex = helper(nums, left, middle - 1);
        return leftMagicIndex != -1 ? leftMagicIndex : helper(nums, middle + 1, right);
    }

}
~~~
