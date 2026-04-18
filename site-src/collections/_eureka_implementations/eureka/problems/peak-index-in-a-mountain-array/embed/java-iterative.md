---
problem_slug: peak-index-in-a-mountain-array
problem_title: Peak Index in a Mountain Array
problem_source_url: https://leetcode.com/problems/peak-index-in-a-mountain-array
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Peak Index in a Mountain Array · Java Iterative
description: Peak Index in a Mountain Array solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/PeakIndexInAMountainArray.java
code_language: java
detail_url: "/eureka/problems/peak-index-in-a-mountain-array/#java-iterative"
embed_url: "/eureka/problems/peak-index-in-a-mountain-array/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

public class PeakIndexInAMountainArray {

    public int peakIndexInMountainArray(int[] nums) {

        int leftPtr = 0;
        int rightPtr = nums.length - 1;
        int peakPtr = -1;

        while (leftPtr <= rightPtr) {

            int midPtr = leftPtr + (rightPtr - leftPtr) / 2;

            if (nums[midPtr] > nums[midPtr + 1]) {
                peakPtr = midPtr;
                rightPtr = midPtr - 1;
            } else
                leftPtr = midPtr + 1;

        }

        return peakPtr;
    }

}
~~~
