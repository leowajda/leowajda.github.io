---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: UtilsApplication.java
tree_path: src/main/java/com/tutego/ch_05/utils/UtilsApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_05/utils/UtilsApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_05/utils/UtilsApplication.java
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
- label: utils
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_05/utils/UtilsApplication.java
description: UtilsApplication.java notes
---

~~~java
package com.tutego.ch_05.utils;

import com.tutego.ch_05.batchOperation.Photo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.jdbc.object.MappingSqlQuery;

import java.time.LocalDate;

@SpringBootApplication
public class UtilsApplication {

    private static final Logger logger = LoggerFactory.getLogger(UtilsApplication.class);

    public UtilsApplication(MappingSqlQuery<Photo> mappingSqlQuery) {
        mappingSqlQuery.execute(false, LocalDate.MIN).stream().map(Photo::toString).forEach(logger::info);
    }

    public static void main(String... args) {
        SpringApplication.run(UtilsApplication.class, args);
    }

}
~~~
