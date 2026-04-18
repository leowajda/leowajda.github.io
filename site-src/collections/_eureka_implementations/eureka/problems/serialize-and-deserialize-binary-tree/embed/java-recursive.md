---
problem_slug: serialize-and-deserialize-binary-tree
problem_title: Serialize and Deserialize Binary Tree
problem_source_url: https://leetcode.com/problems/serialize-and-deserialize-binary-tree
implementation_id: java-recursive
language: java
language_label: Java
approach: recursive
approach_label: Recursive
title: Serialize and Deserialize Binary Tree · Java Recursive
description: Serialize and Deserialize Binary Tree solution in Java using the recursive
  approach.
source_url: https://github.com/leowajda/eureka/blob/master/java/src/main/java/tree/recursive/SerializeAndDeserializeBinaryTree.java
code_language: java
detail_url: "/eureka/problems/serialize-and-deserialize-binary-tree/#java-recursive"
embed_url: "/eureka/problems/serialize-and-deserialize-binary-tree/embed/java-recursive/"
project_slug: eureka
---

~~~java
package tree.recursive;

import tree.TreeNode;

import java.util.Arrays;
import java.util.Iterator;
import java.util.StringJoiner;

public class SerializeAndDeserializeBinaryTree {

    private static final String DELIMITER = ",";
    private static final String NULL      = "X";

    public String serialize(TreeNode root) {
        StringJoiner sj = new StringJoiner(DELIMITER);
        serializeHelper(root, sj);
        return sj.toString();
    }

    private void serializeHelper(TreeNode root, StringJoiner sj) {
        if (root == null) {
            sj.add(NULL);
            return;
        }

        sj.add(Integer.toString(root.val));
        serializeHelper(root.left, sj);
        serializeHelper(root.right, sj);
    }

    public TreeNode deserialize(String data) {
        var iterator = Arrays.asList(data.split(DELIMITER)).iterator();
        return deserializeHelper(iterator);
    }

    private TreeNode deserializeHelper(Iterator<String> iterator) {
        String value = iterator.next();

        if (value.equals(NULL))
            return null;

        var root   = new TreeNode(Integer.parseInt(value));
        root.left  = deserializeHelper(iterator);
        root.right = deserializeHelper(iterator);
        return root;
    }

}
~~~
