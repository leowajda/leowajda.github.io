---
problem_slug: binary-search
problem_title: Binary Search
problem_source_url: https://leetcode.com/problems/binary-search
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Binary Search · Java Iterative
description: Binary Search solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/BinarySearch.java
code_language: java
detail_url: "/eureka/problems/binary-search/#java-iterative"
embed_url: "/eureka/problems/binary-search/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

public class BinarySearch {

    public int search(int[] nums, int target) {

        int leftPtr = 0;
        int rightPtr = nums.length - 1;

        while (leftPtr <= rightPtr) {

            int midPtr = leftPtr + (rightPtr - leftPtr) / 2;

            if (nums[midPtr] == target)
                return midPtr;

            if (nums[midPtr] < target) leftPtr = midPtr + 1;
            else                       rightPtr = midPtr - 1;
        }

        return -1;
    }

}
~~~
