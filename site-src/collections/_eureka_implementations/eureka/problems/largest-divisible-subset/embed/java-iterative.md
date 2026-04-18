---
problem_slug: largest-divisible-subset
problem_title: Largest Divisible Subset
problem_source_url: https://leetcode.com/problems/largest-divisible-subset
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Largest Divisible Subset · Java Iterative
description: Largest Divisible Subset solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/LargestDivisibleSubset.java
code_language: java
detail_url: "/eureka/problems/largest-divisible-subset/#java-iterative"
embed_url: "/eureka/problems/largest-divisible-subset/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class LargestDivisibleSubset {

    public List<Integer> largestDivisibleSubset(int[] nums) {

        int n         = nums.length;
        int max       = 0;
        int[] counter = new int[n];
        int[] prev    = new int[n];

        Arrays.sort(nums);
        Arrays.fill(counter, 1);
        Arrays.fill(prev, -1);

        for (int i = n - 1; i >= 0; i--) {
            for (int j = i + 1; j < n; j++)
                if (nums[j] % nums[i] == 0 && counter[i] <= counter[j] + 1) {
                    counter[i] = counter[j] + 1;
                    prev[i]    = j;
                }

            if (counter[i] > counter[max]) max = i;
        }

        return buildList(prev, nums, max);
    }

    private List<Integer> buildList(int[] prev, int[] nums, int curr) {

        List<Integer> list = new ArrayList<>();
        int ptr = curr;

        while (ptr != -1) {
            list.add(nums[ptr]);
            ptr = prev[ptr];
        }

        return list;
    }

}
~~~
