---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: TypeConversionApplication.java
tree_path: src/main/java/com/tutego/ch_03/typeConversion/TypeConversionApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/typeConversion/TypeConversionApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/typeConversion/TypeConversionApplication.java
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
- label: typeConversion
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_03/typeConversion/TypeConversionApplication.java
description: TypeConversionApplication.java notes
---

~~~java
package com.tutego.ch_03.typeConversion;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.convert.ApplicationConversionService;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Locale;

@ShellComponent
@SpringBootApplication(scanBasePackageClasses = TypeConversionModule.class)
public class TypeConversionApplication {

    private static final Logger logger = LoggerFactory.getLogger(TypeConversionApplication.class);

    public static void main(String... args) {
        SpringApplication.run(TypeConversionApplication.class, args);

        var converter = ApplicationConversionService.getSharedInstance();
        LocaleContextHolder.setLocale(Locale.GERMANY);
        logger.info(converter.convert(LocalDate.now(), String.class));

        LocaleContextHolder.setLocale(Locale.FRANCE);
        logger.info(converter.convert(LocalDate.now(), String.class));
    }

    @ShellMethod("Display if a path exists")
    public String exists(Path path) {
        boolean exists = Files.exists(path);
        return String.format("Path to '%s' %s exist", path, exists ? "does" : "doesn't");
    }

}
~~~
