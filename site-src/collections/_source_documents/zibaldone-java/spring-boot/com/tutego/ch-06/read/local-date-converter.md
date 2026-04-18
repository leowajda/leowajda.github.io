---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: LocalDateConverter.java
tree_path: src/main/java/com/tutego/ch_06/read/LocalDateConverter.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/read/LocalDateConverter.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/read/LocalDateConverter.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_06/read/LocalDateConverter.java
description: LocalDateConverter.java notes
---

~~~java
package com.tutego.ch_06.read;

import org.springframework.core.convert.converter.Converter;
import org.springframework.shell.standard.ShellComponent;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@ShellComponent
public class LocalDateConverter implements Converter<String, LocalDate> {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    @Override
    public LocalDate convert(String raw) {
        try {
            return LocalDate.parse(raw, FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(
                    "Invalid date format. Please use ISO format (yyyy-MM-dd), e.g., 2024-01-15", e
            );
        }
    }
}
~~~
