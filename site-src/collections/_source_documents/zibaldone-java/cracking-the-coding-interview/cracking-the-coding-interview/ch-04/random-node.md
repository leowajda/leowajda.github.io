---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: RandomNode.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/RandomNode.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/RandomNode.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/RandomNode.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_04
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/RandomNode.java
description: RandomNode.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

import java.util.Random;

public class RandomNode {

    private static class TreeNode {

        private TreeNode left, right;
        private final int val;
        private int size;

        public TreeNode(int val) {
            this.val  = val;
            this.size = 1;
        }

        public TreeNode getRandomNode() {
            var random    = new Random();
            int candidate = random.nextInt(size);
            if (candidate == size) return this;
            return candidate < size ? left.getRandomNode() : right.getRandomNode();
        }

        public void insert(int val) {
            size++;

            if (this.val <= val) {
                if (left == null) left = new TreeNode(val);
                else              left.insert(val);
                return;
            }

            if (right == null) right = new TreeNode(val);
            else               right.insert(val);
        }

        public TreeNode find(int val) {
            if (this.val == val) return this;
            if (val < this.val)  return left == null ? null : left.find(val);
            return right == null ? null : right.find(val);
        }

    }

}
~~~
