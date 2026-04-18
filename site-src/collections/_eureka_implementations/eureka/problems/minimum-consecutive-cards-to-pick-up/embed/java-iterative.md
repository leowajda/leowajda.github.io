---
problem_slug: minimum-consecutive-cards-to-pick-up
problem_title: Minimum Consecutive Cards to Pick Up
problem_source_url: https://leetcode.com/problems/minimum-consecutive-cards-to-pick-up
implementation_id: java-iterative
language: java
language_label: Java
approach: iterative
approach_label: Iterative
title: Minimum Consecutive Cards to Pick Up · Java Iterative
description: Minimum Consecutive Cards to Pick Up solution in Java using the iterative
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/array/iterative/MinimumConsecutiveCardsToPickUp.java
code_language: java
detail_url: "/eureka/problems/minimum-consecutive-cards-to-pick-up/#java-iterative"
embed_url: "/eureka/problems/minimum-consecutive-cards-to-pick-up/embed/java-iterative/"
project_slug: eureka
---

~~~java
package array.iterative;

import java.util.stream.IntStream;

public class MinimumConsecutiveCardsToPickUp {

    public int minimumCardPickup(int[] cards) {

        int minMoves  = Integer.MAX_VALUE;
        int maxCard   = IntStream.of(cards).max().orElse(0);
        int[] counter = new int[maxCard + 1];

        for (int leftPtr = 0, rightPtr = 0; rightPtr < cards.length; rightPtr++) {
            counter[cards[rightPtr]] += 1;

            while (counter[cards[rightPtr]] == 2) {
                minMoves = Math.min(minMoves, rightPtr - leftPtr + 1);
                counter[cards[leftPtr]] -= 1;
                leftPtr++;
            }
        }

        return minMoves == Integer.MAX_VALUE ? -1 : minMoves;
    }

}
~~~
