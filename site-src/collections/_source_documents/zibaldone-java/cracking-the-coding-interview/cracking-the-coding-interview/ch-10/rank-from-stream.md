---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: RankFromStream.java
tree_path: src/main/java/cracking_the_coding_interview/ch_10/RankFromStream.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/RankFromStream.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/RankFromStream.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_10/RankFromStream.java
description: RankFromStream.java notes
---

~~~java
package cracking_the_coding_interview.ch_10;

public class RankFromStream {

    private static class Node {
        public Node left, right;
        public int value;
        public int leftSize;

        public Node(int value) {
            this.value    = value;
            this.leftSize = 1;
        }

        public void add(int value) {

            if (value <= this.value) {
                if (left == null) left = new Node(value);
                else              left.add(value);
                leftSize++;
                return;
            }

            if (right == null) right = new Node(value);
            else               right.add(value);
        }

        public int getRank(int value) {

            if (this.value == value)
                return leftSize;

            if (this.value > value)
                return left == null ? -1 : left.getRank(value);

            int rightRank =  right == null ? -1 : right.getRank(value);
            return rightRank == -1 ? rightRank : leftSize + rightRank;
        }
    }

    private static Node root;

    private static int getRankOfNumber(int num) {
        if (root == null) root = new Node(num);
        else              root.add(num);
        return root.getRank(num);
    }

}
~~~
