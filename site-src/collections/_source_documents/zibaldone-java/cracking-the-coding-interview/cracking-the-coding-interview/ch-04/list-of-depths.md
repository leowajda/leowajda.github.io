---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: ListOfDepths.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/ListOfDepths.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/ListOfDepths.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/ListOfDepths.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/ListOfDepths.java
description: ListOfDepths.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

public class ListOfDepths {

    private static List<List<TreeNode>> listOfDepths(TreeNode root) {

        Queue<TreeNode> queue = new ArrayDeque<>(List.of(root));
        List<List<TreeNode>> listOfDepths = new ArrayList<>();

        while (!queue.isEmpty()) {

            int n = queue.size();
            List<TreeNode> listOfDepth = new ArrayList<>();

            for (int i = 0; i < n; i++) {
                var node = queue.remove();
                listOfDepth.add(node);
                if (node.left != null)  queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }

            listOfDepths.add(listOfDepth);
        }

        return listOfDepths;
    }

}
~~~
