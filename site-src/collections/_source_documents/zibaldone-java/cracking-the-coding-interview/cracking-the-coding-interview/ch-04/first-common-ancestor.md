---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: FirstCommonAncestor.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/FirstCommonAncestor.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/FirstCommonAncestor.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/FirstCommonAncestor.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/FirstCommonAncestor.java
description: FirstCommonAncestor.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

public class FirstCommonAncestor {

    private static TreeNode firstCommonAncestor(TreeNode root, TreeNode a, TreeNode b) {
        if (root == null || root == a || root == b)
            return root;

        var leftAncestor  = firstCommonAncestor(root.left, a, b);
        var rightAncestor = firstCommonAncestor(root.right, a, b);

        if (leftAncestor != null && rightAncestor != null) return root;
        return leftAncestor != null ? leftAncestor : rightAncestor;
    }

}
~~~
