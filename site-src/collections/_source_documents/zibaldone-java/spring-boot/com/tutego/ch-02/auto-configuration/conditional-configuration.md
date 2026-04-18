---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ConditionalConfiguration.java
tree_path: src/main/java/com/tutego/ch_02/autoConfiguration/ConditionalConfiguration.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/ConditionalConfiguration.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/ConditionalConfiguration.java
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
- label: autoConfiguration
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/autoConfiguration/ConditionalConfiguration.java
description: ConditionalConfiguration.java notes
---

~~~java
package com.tutego.ch_02.autoConfiguration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ConditionalConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(ConditionalConfiguration.class);

    private static class A {
        public A() {
            logger.info("bean: a has been created");
        }
    }

    @Bean
    @ConditionalOnExpression("1+1==2")
    public A conditionalBeanOne() {
        return new A();
    }

    @Bean
    @ConditionalOnProperty(name = "conditional.property", havingValue = "true")
    public A conditionalBeanTwo() {
        return new A();
    }

}
~~~
