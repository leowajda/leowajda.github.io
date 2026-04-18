---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ValidationApplication.java
tree_path: src/main/java/com/tutego/ch_04/validation/ValidationApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_04/validation/ValidationApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_04/validation/ValidationApplication.java
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
- label: validation
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_04/validation/ValidationApplication.java
description: ValidationApplication.java notes
---

~~~java
package com.tutego.ch_04.validation;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@ConfigurationPropertiesScan
@SpringBootApplication(scanBasePackageClasses = ValidationModule.class)
public class ValidationApplication {

    private static final Logger logger = LoggerFactory.getLogger(ValidationApplication.class);

    // when a Jakarta Bean Validator implementation is present in the classpath,
    // Spring autoconfiguration constructs a Validator as a managed bean that can be injected by a client for use
    public ValidationApplication(
            jakarta.validation.Validator validator,
            PhotoService photoService,
            GeometryProperties geometryProperties
    ) {
        logger.info("PhotoService proxy: {}", photoService.getClass().getName());
        var photo = new Photo(
                1L,
                -1L,
                "äöü",
                false,
                LocalDateTime.now().plusDays(1)
        );

        var errors = validator.validate(photo); // manually validate input
        logger.info("errors: {}", errors.stream().map(ConstraintViolation::getMessage).collect(Collectors.joining(", ")));

        try { // validate input declaratively
            photoService.checkValidity(photo);
        } catch (ConstraintViolationException exception) {
            logger.info("proxy has rejected photo: {}", photo);
        }

        try { // validate output declaratively
            photoService.invalidOutput();
        } catch (ConstraintViolationException exception) {
            logger.info("invalid return value for call: 'photoService.invalidOutput()'");
        }

        // validate configuration declaratively
        logger.info("geometryProperties: {}", geometryProperties);

    }

    public static void main(String... args) {
        SpringApplication.run(ValidationApplication.class, args);
    }
}
~~~
