---
problem_slug: subarray-sum-equals-k
problem_title: Subarray Sum Equals K
problem_source_url: https://leetcode.com/problems/subarray-sum-equals-k
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Subarray Sum Equals K · Java Iterative
description: Subarray Sum Equals K solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/SubarraySumEqualsK.java
code_language: java
detail_url: "/eureka/problems/subarray-sum-equals-k/#java-iterative"
embed_url: "/eureka/problems/subarray-sum-equals-k/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.HashMap;
import java.util.Map;

public class SubarraySumEqualsK {

    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> prefixSum = new HashMap<>();
        prefixSum.put(0, 1);

        int currSum = 0;
        int count   = 0;
        for (var num : nums) {
            currSum += num;
            count   += prefixSum.getOrDefault(currSum - k, 0);
            prefixSum.merge(currSum, 1, Integer::sum);
        }

        return count;
    }

}
~~~
