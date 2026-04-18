---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: CommaSeparatedStringToListConverter.java
tree_path: src/main/java/com/tutego/ch_06/advanced/CommaSeparatedStringToListConverter.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/advanced/CommaSeparatedStringToListConverter.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/advanced/CommaSeparatedStringToListConverter.java
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
- label: advanced
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_06/advanced/CommaSeparatedStringToListConverter.java
description: CommaSeparatedStringToListConverter.java notes
---

~~~java
package com.tutego.ch_06.advanced;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Converter(autoApply = true) // applies the converter globally to all lists of strings, can also be set per attribute or referenced similarly to a @NamedQuery
public class CommaSeparatedStringToListConverter implements AttributeConverter<List<String>, String> {
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        return attribute == null || attribute.isEmpty() ? "" : String.join(",", attribute);
    }

    @Override
    public List<String> convertToEntityAttribute(String column) {
        if (column == null || column.isBlank()) return new ArrayList<>();
        return new ArrayList<>(Arrays.asList(column.split(",")));
    }
}
~~~
