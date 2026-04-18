---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: JakartaPersistenceReadApplication.java
tree_path: src/main/java/com/tutego/ch_06/read/JakartaPersistenceReadApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/read/JakartaPersistenceReadApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/read/JakartaPersistenceReadApplication.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_06/read/JakartaPersistenceReadApplication.java
description: JakartaPersistenceReadApplication.java notes
---

~~~java
package com.tutego.ch_06.read;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackageClasses = JakartaPersistenceReadModule.class)
public class JakartaPersistenceReadApplication {

    public static void main(String... args) {
        SpringApplication.run(JakartaPersistenceReadApplication.class, args);
    }

}
~~~
