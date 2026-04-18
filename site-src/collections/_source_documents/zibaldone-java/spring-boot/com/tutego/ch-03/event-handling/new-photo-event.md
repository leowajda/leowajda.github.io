---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: NewPhotoEvent.java
tree_path: src/main/java/com/tutego/ch_03/eventHandling/NewPhotoEvent.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/eventHandling/NewPhotoEvent.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/eventHandling/NewPhotoEvent.java
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
- label: ch_03
  url: ''
- label: eventHandling
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_03/eventHandling/NewPhotoEvent.java
description: NewPhotoEvent.java notes
---

~~~java
package com.tutego.ch_03.eventHandling;

import java.time.OffsetDateTime;

public record NewPhotoEvent(String name, OffsetDateTime dateTime) { }
~~~
