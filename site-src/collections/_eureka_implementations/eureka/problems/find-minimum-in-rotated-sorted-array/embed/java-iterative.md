---
problem_slug: find-minimum-in-rotated-sorted-array
problem_title: Find Minimum in Rotated Sorted Array
problem_source_url: https://leetcode.com/problems/find-minimum-in-rotated-sorted-array
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Find Minimum in Rotated Sorted Array · Java Iterative
description: Find Minimum in Rotated Sorted Array solution in Java using the iterative
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/FindMinimumInRotatedSortedArray.java
code_language: java
detail_url: "/eureka/problems/find-minimum-in-rotated-sorted-array/#java-iterative"
embed_url: "/eureka/problems/find-minimum-in-rotated-sorted-array/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

public class FindMinimumInRotatedSortedArray {

    public int findMin(int[] nums) {

        int leftPtr = 0;
        int midPtr = -1;
        int rightPtr = nums.length - 1;

        while (leftPtr <= rightPtr) {

            midPtr = leftPtr + (rightPtr - leftPtr) / 2;

            if (midPtr > 0 && nums[midPtr - 1] > nums[midPtr])
                return nums[midPtr];

            if (nums[midPtr] > nums[rightPtr]) leftPtr = midPtr + 1;
            else                               rightPtr = midPtr - 1;
        }

        return nums[midPtr];
    }

}
~~~
