---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: YearMonthRangeFormatterConfig.java
tree_path: src/main/java/com/tutego/ch_09/mappers/YearMonthRangeFormatterConfig.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/mappers/YearMonthRangeFormatterConfig.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/mappers/YearMonthRangeFormatterConfig.java
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
- label: mappers
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/mappers/YearMonthRangeFormatterConfig.java
description: YearMonthRangeFormatterConfig.java notes
---

~~~java
package com.tutego.ch_09.mappers;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.Formatter;

@Configuration
class YearMonthRangeFormatterConfig {

    @Bean // registers a formatter to be used by ConversionService
    public Formatter<YearMonthRange> yearMonthRangeFormatter() {
        return new YearMonthRangeFormatter();
    }

}
~~~
