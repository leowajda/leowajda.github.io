---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: GenderConverter.java
tree_path: src/main/java/com/tutego/ch_06/read/GenderConverter.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/read/GenderConverter.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/read/GenderConverter.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_06/read/GenderConverter.java
description: GenderConverter.java notes
---

~~~java
package com.tutego.ch_06.read;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class GenderConverter implements AttributeConverter<Gender, Byte> {
    @Override
    public Byte convertToDatabaseColumn(Gender gender) {
        return switch (gender) {
            case FEMALE -> 1;
            case MALE -> 2;
        };
    }

    @Override
    public Gender convertToEntityAttribute(Byte gender) {
        return switch (gender) {
            case 1 -> Gender.FEMALE;
            case 2 -> Gender.MALE;
            default -> throw new IllegalStateException("Unexpected value: " + gender);
        };
    }
}
~~~
