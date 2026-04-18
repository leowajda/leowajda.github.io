---
problem_slug: find-smallest-letter-greater-than-target
problem_title: Find Smallest Letter Greater Than Target
problem_source_url: https://leetcode.com/problems/find-smallest-letter-greater-than-target
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Find Smallest Letter Greater Than Target · Java Iterative
description: Find Smallest Letter Greater Than Target solution in Java using the iterative
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/FindSmallestLetterGreaterThanTarget.java
code_language: java
detail_url: "/eureka/problems/find-smallest-letter-greater-than-target/#java-iterative"
embed_url: "/eureka/problems/find-smallest-letter-greater-than-target/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

public class FindSmallestLetterGreaterThanTarget {

    public char nextGreatestLetter(char[] letters, char target) {

        int leftPtr = 0;
        int rightPtr = letters.length - 1;
        char nextGreatestLetter = letters[0];

        while (leftPtr <= rightPtr) {

            int midPtr = leftPtr + (rightPtr - leftPtr) / 2;

            if (letters[midPtr] > target) {
                nextGreatestLetter = letters[midPtr];
                rightPtr = midPtr - 1;
            } else
                leftPtr = midPtr + 1;

        }

        return nextGreatestLetter;
    }

}
~~~
