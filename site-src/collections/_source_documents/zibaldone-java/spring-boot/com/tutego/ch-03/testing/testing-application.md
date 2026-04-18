---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: TestingApplication.java
tree_path: src/main/java/com/tutego/ch_03/testing/TestingApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/testing/TestingApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/testing/TestingApplication.java
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
- label: testing
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_03/testing/TestingApplication.java
description: TestingApplication.java notes
---

~~~java
package com.tutego.ch_03.testing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// used in src/test/java/
@SpringBootApplication
public class TestingApplication {
    public static void main(String... args) {
        SpringApplication.run(TestingApplication.class, args);
    }
}
~~~
