---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: VolumeOfHistogram.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/VolumeOfHistogram.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/VolumeOfHistogram.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/VolumeOfHistogram.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_17
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/VolumeOfHistogram.java
description: VolumeOfHistogram.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

public class VolumeOfHistogram {

    private static int volumeOfHistogram(int[] height) {

        int n = height.length;
        int maxLeft = 0, maxRight = 0;
        int leftPtr = 0, rightPtr = n - 1;

        int res = 0;
        while (leftPtr <= rightPtr)
            if (maxLeft <= maxRight) {
                res += Math.max(0, maxLeft - height[leftPtr]);
                maxLeft = Math.max(maxLeft, height[leftPtr]);
                leftPtr++;
            } else {
                res += Math.max(0, maxRight - height[rightPtr]);
                maxRight = Math.max(maxRight, height[rightPtr]);
                rightPtr--;
            }

        return res;
    }

}
~~~
