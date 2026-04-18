---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: RandomConfiguration.java
tree_path: src/main/java/com/tutego/ch_02/configurationClasses/injectionPoint/RandomConfiguration.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/configurationClasses/injectionPoint/RandomConfiguration.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/configurationClasses/injectionPoint/RandomConfiguration.java
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
- label: ch_02
  url: ''
- label: configurationClasses
  url: ''
- label: injectionPoint
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/configurationClasses/injectionPoint/RandomConfiguration.java
description: RandomConfiguration.java notes
---

~~~java
package com.tutego.ch_02.configurationClasses.injectionPoint;

import org.springframework.beans.factory.InjectionPoint;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

import java.lang.reflect.AnnotatedElement;
import java.security.SecureRandom;
import java.util.Random;

import static java.util.Objects.nonNull;

@Configuration
public class RandomConfiguration {

    @Bean
    @Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE) // <- bean doesn't get memoized
    public Random random(InjectionPoint injectionPoint) {
        return nonNull(injectionPoint.getAnnotation(CryptographicallyStrong.class)) || (injectionPoint.getMember() instanceof AnnotatedElement member && member.isAnnotationPresent(CryptographicallyStrong.class)) ? new SecureRandom() : new Random();
    }

}
~~~
