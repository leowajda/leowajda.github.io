---
problem_slug: two-sum
problem_title: Two Sum
problem_source_url: https://leetcode.com/problems/two-sum
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Two Sum · Java Iterative
description: Two Sum solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/TwoSum.java
code_language: java
detail_url: "/eureka/problems/two-sum/#java-iterative"
embed_url: "/eureka/problems/two-sum/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.HashMap;
import java.util.Map;

public class TwoSum {
    public int[] twoSum(int[] nums, int target) {

        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement))
                return new int[] { map.get(complement), i };
            map.put(nums[i], i);
        }

        return new int[] { -1, -1 };
    }
}
~~~
