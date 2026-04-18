---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: InternationalizationApplication.java
tree_path: src/main/java/com/tutego/ch_03/internationalization/InternationalizationApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/internationalization/InternationalizationApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/internationalization/InternationalizationApplication.java
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
- label: internationalization
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_03/internationalization/InternationalizationApplication.java
description: InternationalizationApplication.java notes
---

~~~java
package com.tutego.ch_03.internationalization;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.MessageSource;
import org.springframework.context.support.MessageSourceAccessor;

@SpringBootApplication(scanBasePackageClasses = InternationalizationModule.class)
public class InternationalizationApplication {

    private static final Logger logger = LoggerFactory.getLogger(InternationalizationApplication.class);

    // Spring utility class (avoids Locale boilerplate)
    private final MessageSourceAccessor messageSourceAccessor;

    public InternationalizationApplication(MessageSource messageSource) {
        this.messageSourceAccessor = new MessageSourceAccessor(messageSource);
        logger.info(messageSourceAccessor.getMessage("shell.fs.path-exist", new Object[]{"some-argument"}));
        logger.info(messageSourceAccessor.getMessage("shell.fs.path-not-exist", new Object[]{"some-other-argument"}));
    }

    public static void main(String... args) {
        SpringApplication.run(InternationalizationApplication.class, args);
    }

}
~~~
