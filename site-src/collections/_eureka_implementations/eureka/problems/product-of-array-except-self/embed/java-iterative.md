---
problem_slug: product-of-array-except-self
problem_title: Product of Array Except Self
problem_source_url: https://leetcode.com/problems/product-of-array-except-self
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Product of Array Except Self · Java Iterative
description: Product of Array Except Self solution in Java using the iterative approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/ProductOfArrayExceptSelf.java
code_language: java
detail_url: "/eureka/problems/product-of-array-except-self/#java-iterative"
embed_url: "/eureka/problems/product-of-array-except-self/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

public class ProductOfArrayExceptSelf {

    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];

        int leftProduct = 1;
        for (int i = 0; i < n; i++) {
            answer[i]    = leftProduct;
            leftProduct *= nums[i];
        }

        int rightProduct = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i]    *= rightProduct;
            rightProduct *= nums[i];
        }

        return answer;
    }

}
~~~
