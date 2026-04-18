---
problem_slug: find-first-and-last-position-of-element-in-sorted-array
problem_title: Find First and Last Position of Element in Sorted Array
problem_source_url: https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Find First and Last Position of Element in Sorted Array · Java Iterative
description: Find First and Last Position of Element in Sorted Array solution in Java
  using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/FindFirstAndLastPositionOfElementInSortedArray.java
code_language: java
detail_url: "/eureka/problems/find-first-and-last-position-of-element-in-sorted-array/#java-iterative"
embed_url: "/eureka/problems/find-first-and-last-position-of-element-in-sorted-array/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

public class FindFirstAndLastPositionOfElementInSortedArray {

    public int[] searchRange(int[] nums, int target) {
        int firstPosition = firstPosition(nums, target);
        int lastPosition  = lastPosition(nums, target);
        return new int[] { firstPosition, lastPosition };
    }

    private int firstPosition(int[] nums, int target) {

        int leftPtr = 0;
        int rightPtr = nums.length - 1;
        int firstPosition = -1;

        while (leftPtr <= rightPtr) {

            int midPtr = leftPtr + (rightPtr - leftPtr) / 2;

            if (nums[midPtr] >= target) {
                if (nums[midPtr] == target) firstPosition = midPtr;
                rightPtr = midPtr - 1;
            } else
                leftPtr = midPtr + 1;

        }

        return firstPosition;
    }

    private int lastPosition(int[] nums, int target) {

        int leftPtr = 0;
        int rightPtr = nums.length - 1;
        int lastPosition = -1;

        while (leftPtr <= rightPtr) {

            int midPtr = leftPtr + (rightPtr - leftPtr) / 2;

            if (nums[midPtr] <= target) {
                if (nums[midPtr] == target) lastPosition = midPtr;
                leftPtr = midPtr + 1;
            } else
                rightPtr = midPtr - 1;

        }

        return lastPosition;
    }

}
~~~
