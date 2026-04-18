---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: RouteBetweenNodes.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/RouteBetweenNodes.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/RouteBetweenNodes.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/RouteBetweenNodes.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/RouteBetweenNodes.java
description: RouteBetweenNodes.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

import java.util.*;

public class RouteBetweenNodes {

    private static boolean areNodesConnected(GraphNode start, GraphNode end) {
        Queue<GraphNode> queue = new ArrayDeque<>(List.of(start));
        Set<GraphNode> visited = new HashSet<>(List.of(start));

        while (!queue.isEmpty()) {
            var node = queue.remove();

            if (node == end)
                return true;

            for (var child : node.children)
                if (visited.add(child))
                    queue.add(child);
        }

        return false;
    }

}
~~~
