---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: AdvancedController.java
tree_path: src/main/java/com/tutego/ch_09/advanced/AdvancedController.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/advanced/AdvancedController.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/advanced/AdvancedController.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_09/advanced/AdvancedController.java
description: AdvancedController.java notes
---

~~~java
package com.tutego.ch_09.advanced;

import jakarta.validation.Valid;
import org.springframework.core.convert.ConversionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdvancedController {

    private final ProfileMapper profileMapper;

    public AdvancedController(ProfileMapper profileMapper, ConversionService conversionService) {
        this.profileMapper = profileMapper;
        // profileMapper.convert(profile)
        // conversionService.convert(profile, ProfileDto.class);
    }

    @PutMapping("validate") // in case validation were to fail, an exception would be thrown
    public ResponseEntity<?> update(@Valid /* will not work on Optional<T> */ @RequestBody ProfileDto dto) {
        return ResponseEntity.accepted().body(dto);
    }

}
~~~
