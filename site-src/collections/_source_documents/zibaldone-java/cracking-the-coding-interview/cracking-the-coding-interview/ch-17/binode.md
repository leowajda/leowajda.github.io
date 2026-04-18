---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: Binode.java
tree_path: src/main/java/cracking_the_coding_interview/ch_17/Binode.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/Binode.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_17/Binode.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_17/Binode.java
description: Binode.java notes
---

~~~java
package cracking_the_coding_interview.ch_17;

public class Binode {

    Binode left, right;
    int data;

    public Binode(Binode left, Binode right, int data) {
        this.left = left;
        this.right = right;
        this.data = data;
    }

    private static Binode prev;

    private static Binode convert(Binode root) {
        var dummy = new Binode(null, null, -1);
        prev = dummy;
        helper(root);
        return dummy.right;
    }

    private static void helper(Binode root) {
        if (root == null)
            return;

        helper(root.left);
        prev.right = root;
        prev       = root;
        root.left  = null;
        helper(root.right);
    }

}
~~~
