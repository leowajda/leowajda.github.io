---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ConversionServiceConfig.java
tree_path: src/main/java/com/tutego/ch_03/typeConversion/ConversionServiceConfig.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/typeConversion/ConversionServiceConfig.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/typeConversion/ConversionServiceConfig.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_03/typeConversion/ConversionServiceConfig.java
description: ConversionServiceConfig.java notes
---

~~~java
package com.tutego.ch_03.typeConversion;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.convert.ApplicationConversionService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.ConversionService;

@Configuration
public class ConversionServiceConfig {

    @Bean
    @ConditionalOnMissingBean /* not always injected depends on the classpath */
    public ConversionService conversionService() {
        return ApplicationConversionService.getSharedInstance();
    }

}
~~~
