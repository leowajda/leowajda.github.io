---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: NicknameLastSeen.java
tree_path: src/main/java/com/tutego/ch_05/jdbcTemplate/NicknameLastSeen.java
source_path: spring-boot/src/main/java/com/tutego/ch_05/jdbcTemplate/NicknameLastSeen.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_05/jdbcTemplate/NicknameLastSeen.java
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
- label: ch_05
  url: ''
- label: jdbcTemplate
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_05/jdbcTemplate/NicknameLastSeen.java
description: NicknameLastSeen.java notes
---

~~~java
package com.tutego.ch_05.jdbcTemplate;

import java.time.LocalDateTime;

public record NicknameLastSeen(String name, LocalDateTime seen) { }
~~~
