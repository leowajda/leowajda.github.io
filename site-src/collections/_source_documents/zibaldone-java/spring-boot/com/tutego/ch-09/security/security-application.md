---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: SecurityApplication.java
tree_path: src/main/java/com/tutego/ch_09/security/SecurityApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/security/SecurityApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/security/SecurityApplication.java
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
- label: security
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/security/SecurityApplication.java
description: SecurityApplication.java notes
---

~~~java
package com.tutego.ch_09.security;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackageClasses = SecurityModule.class)
public class SecurityApplication {

    public static void main(String... args) {
        SpringApplication.run(SecurityApplication.class, args);
    }

}
~~~
