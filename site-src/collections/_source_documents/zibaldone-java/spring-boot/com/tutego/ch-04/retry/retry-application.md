---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: RetryApplication.java
tree_path: src/main/java/com/tutego/ch_04/retry/RetryApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_04/retry/RetryApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_04/retry/RetryApplication.java
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
- label: ch_04
  url: ''
- label: retry
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_04/retry/RetryApplication.java
description: RetryApplication.java notes
---

~~~java
package com.tutego.ch_04.retry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@EnableRetry
@SpringBootApplication
public class RetryApplication {

    private static final Logger logger = LoggerFactory.getLogger(RetryApplication.class);

    public RetryApplication(RandomPhoto randomPhoto)  {
        logger.info("RandomPhoto proxy: {}", randomPhoto.getClass().getName());

        try {
            var json = randomPhoto.receive("male");
            logger.info("received json: {}", json);
        } catch (Exception exception) {
            logger.info("exception: {}", exception.getMessage());
        }

    }

    public static void main(String... args) {
        SpringApplication.run(RetryApplication.class, args);
    }
}
~~~
