---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ProfileMapper.java
tree_path: src/main/java/com/tutego/ch_09/advanced/ProfileMapper.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/advanced/ProfileMapper.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/advanced/ProfileMapper.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_09/advanced/ProfileMapper.java
description: ProfileMapper.java notes
---

~~~java
package com.tutego.ch_09.advanced;

import com.tutego.ch_07.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.springframework.core.convert.converter.Converter;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProfileMapper extends Converter<Profile, ProfileDto> {
    ProfileDto convert(Profile profile);
}
~~~
