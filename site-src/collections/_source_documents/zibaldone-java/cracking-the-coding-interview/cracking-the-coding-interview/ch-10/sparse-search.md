---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: SparseSearch.java
tree_path: src/main/java/cracking_the_coding_interview/ch_10/SparseSearch.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/SparseSearch.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/SparseSearch.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_10/SparseSearch.java
description: SparseSearch.java notes
---

~~~java
package cracking_the_coding_interview.ch_10;

public class SparseSearch {

    private static int search(String[] words, String target) {
        return target == null || target.isEmpty() ? -1 : helper(words, target, 0, words.length - 1);
    }

    private static int helper(String[] words, String target, int left, int right) {

        if (left > right) return -1;
        int middle = left + (right - left) / 2;
        var middleWord = words[middle];

        if (middleWord.equals(target))
            return middle;

        if (middleWord.isEmpty()) {
            int leftVal = helper(words, target, left, middle - 1);
            return leftVal != -1 ? leftVal : helper(words, target, middle + 1, right);
        }

        return middleWord.compareTo(target) < 0 ? helper(words, target, middle + 1, right) : helper(words, target, left, middle - 1);
    }

}
~~~
