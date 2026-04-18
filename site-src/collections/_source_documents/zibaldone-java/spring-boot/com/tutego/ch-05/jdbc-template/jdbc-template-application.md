---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: JdbcTemplateApplication.java
tree_path: src/main/java/com/tutego/ch_05/jdbcTemplate/JdbcTemplateApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_05/jdbcTemplate/JdbcTemplateApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_05/jdbcTemplate/JdbcTemplateApplication.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_05/jdbcTemplate/JdbcTemplateApplication.java
description: JdbcTemplateApplication.java notes
---

~~~java
package com.tutego.ch_05.jdbcTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackageClasses = JdbcTemplateModule.class)
public class JdbcTemplateApplication {

    private static final Logger logger = LoggerFactory.getLogger(JdbcTemplateApplication.class);

    public static void main(String... args) {
        SpringApplication.run(JdbcTemplateApplication.class, args);
    }

}
~~~
