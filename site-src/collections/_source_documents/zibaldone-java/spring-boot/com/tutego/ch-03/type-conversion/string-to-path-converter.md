---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: StringToPathConverter.java
tree_path: src/main/java/com/tutego/ch_03/typeConversion/StringToPathConverter.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/typeConversion/StringToPathConverter.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/typeConversion/StringToPathConverter.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_03/typeConversion/StringToPathConverter.java
description: StringToPathConverter.java notes
---

~~~java
package com.tutego.ch_03.typeConversion;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.nio.file.Path;

// see also GenericConverter and ConverterFactory
@Component
class StringToPathConverter implements Converter<String, Path> {

    @Override
    public Path convert(String source) {
        return Path.of(source);
    }
}
~~~
