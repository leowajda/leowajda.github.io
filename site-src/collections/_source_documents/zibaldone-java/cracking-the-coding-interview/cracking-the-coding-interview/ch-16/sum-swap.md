---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: SumSwap.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/SumSwap.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/SumSwap.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/SumSwap.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/SumSwap.java
description: SumSwap.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.IntStream;

public class SumSwap {

    private static int[] sumSwap(int[] a, int[] b) {
        int aSum = IntStream.of(a).sum();
        int bSum = IntStream.of(b).sum();

        int target = aSum - bSum;
        if (target % 2 != 0) return new int[] { };

        Set<Integer> bNums = new HashSet<>();
        IntStream.of(b).forEach(bNums::add);
        target /= 2;

        for (var aNum : a) {
            int diff = aNum - target;
            if (bNums.contains(diff)) return new int[] { aNum, diff };
        }

        return new int[] { };
    }

}
~~~
