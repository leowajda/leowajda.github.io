---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: LastSeenStatistics.java
tree_path: src/main/java/com/tutego/ch_09/mappers/LastSeenStatistics.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/mappers/LastSeenStatistics.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/mappers/LastSeenStatistics.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Spring Boot
  url: "/zibaldone-java/spring-boot/"
- label: com
  url: ''
- label: tutego
  url: ''
- label: ch_09
  url: ''
- label: mappers
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/mappers/LastSeenStatistics.java
description: LastSeenStatistics.java notes
---

~~~java
package com.tutego.ch_09.mappers;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.YearMonth;
import java.util.List;

public record LastSeenStatistics(List<Data> data) {
    record Data(@JsonProperty("x") YearMonth yearMonth, @JsonProperty("y") int count) {}
}
~~~
