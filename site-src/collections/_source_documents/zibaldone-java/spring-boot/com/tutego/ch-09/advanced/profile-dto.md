---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ProfileDto.java
tree_path: src/main/java/com/tutego/ch_09/advanced/ProfileDto.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/advanced/ProfileDto.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/advanced/ProfileDto.java
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
- label: ch_09
  url: ''
- label: advanced
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/advanced/ProfileDto.java
description: ProfileDto.java notes
---

~~~java
package com.tutego.ch_09.advanced;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Positive;
import org.hibernate.validator.constraints.Length;
import org.springframework.lang.NonNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProfileDto(
        @Min(1) Long id,
        @NonNull @Length(min = 10, max = 200) String nickname,
        @Past LocalDate birthdate,
        @Positive int maneLength,
        @Min(1) int gender,
        @Min(1) Integer attractedToGender,
        String description,
        @Past LocalDateTime lastSeen
) { }
~~~
