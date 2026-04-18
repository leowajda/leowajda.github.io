---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: MasterMind.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/MasterMind.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/MasterMind.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/MasterMind.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_16
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/MasterMind.java
description: MasterMind.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

import java.util.*;

public class MasterMind {

    private record Result(int hits, int pseudoHits) {}

    enum Ball { Red, Yellow, Green, Blue }

    private static Result masterMind(Ball[] solution, Ball[] guess) {
        if (solution == null || guess == null || solution.length != guess.length)
            return new Result(-1, -1);

        Map<Ball, Integer> frequency = new HashMap<>(solution.length);
        int hits = 0;

        for (int i = 0; i < solution.length; i++) {
            frequency.merge(solution[i], 1, Integer::sum);
            if (solution[i] == guess[i]) {
                frequency.merge(solution[i], -1, Integer::sum);
                hits++;
            }
        }

        int pseudoHits = 0;
        for (int i = 0; i < guess.length; i++)
            if (frequency.getOrDefault(guess[i], 0) > 0 && solution[i] != guess[i]) {
                frequency.merge(guess[i], -1, Integer::sum);
                pseudoHits++;
            }

        return new Result(hits, pseudoHits);
    }

}
~~~
