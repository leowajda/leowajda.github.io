---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: BuildOrder.java
tree_path: src/main/java/cracking_the_coding_interview/ch_04/BuildOrder.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/BuildOrder.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_04/BuildOrder.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_04/BuildOrder.java
description: BuildOrder.java notes
---

~~~java
package cracking_the_coding_interview.ch_04;

import java.util.*;

public class BuildOrder {

    private static List<String> buildOrder(List<List<String>> projects) {

        Map<String, List<String>> graph = new HashMap<>();
        Map<String, Integer> inDegree   = new HashMap<>();
        Set<String> allProjects         = new HashSet<>();

        for (var project : projects) {
            String from = project.getFirst(), to = project.getLast();
            allProjects.add(from);
            allProjects.add(to);
        }

        for (var project : allProjects) {
            graph.put(project, new ArrayList<>());
            inDegree.put(project, 0);
        }

        for (var project : projects) {
            String from = project.getFirst(), to = project.getLast();
            graph.get(from).add(to);
            inDegree.merge(to, 1, Integer::sum);
        }

        Queue<String> queue = new ArrayDeque<>();
        for (var project : allProjects)
            if (inDegree.get(project) == 0)
                queue.add(project);

        List<String> order = new ArrayList<>();
        while (!queue.isEmpty()) {
            var project = queue.remove();
            order.add(project);

            for (var neigh : graph.get(project)) {
                var countNeighs = inDegree.merge(neigh, -1, Integer::sum);
                if (countNeighs == 0) queue.add(neigh);
            }
        }

        return order.size() == allProjects.size() ? order : null;
    }

}
~~~
