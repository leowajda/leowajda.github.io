---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ShortProfile.java
tree_path: src/main/java/com/tutego/ch_06/read/ShortProfile.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/read/ShortProfile.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/read/ShortProfile.java
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
- label: ch_06
  url: ''
- label: read
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_06/read/ShortProfile.java
description: ShortProfile.java notes
---

~~~java
package com.tutego.ch_06.read;

public record ShortProfile(String nickname, short maneLength) { }
~~~
