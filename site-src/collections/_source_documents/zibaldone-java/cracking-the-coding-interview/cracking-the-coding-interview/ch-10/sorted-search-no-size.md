---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: SortedSearchNoSize.java
tree_path: src/main/java/cracking_the_coding_interview/ch_10/SortedSearchNoSize.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/SortedSearchNoSize.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/SortedSearchNoSize.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_10
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_10/SortedSearchNoSize.java
description: SortedSearchNoSize.java notes
---

~~~java
package cracking_the_coding_interview.ch_10;

public class SortedSearchNoSize {

    private abstract static class Listy {
        public abstract int elementAt(int idx);
    }

    private static int search(Listy listy, int target) {

        int left = 0, right = Integer.MAX_VALUE;
        while (left <= right) {

            int middle    = left + (right - left) / 2;
            int middleVal = listy.elementAt(middle);

            if (middleVal == target) return middle;

            if (middleVal == -1 || middleVal > target) right = middle - 1;
            else                                       left  = middle + 1;
        }

        return -1;
    }

}
~~~
