---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: HierarchicalContextApplication.java
tree_path: src/main/java/com/tutego/ch_02/beanLifeCycle/hierarchicalContext/HierarchicalContextApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/beanLifeCycle/hierarchicalContext/HierarchicalContextApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/beanLifeCycle/hierarchicalContext/HierarchicalContextApplication.java
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
- label: beanLifeCycle
  url: ''
- label: hierarchicalContext
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/beanLifeCycle/hierarchicalContext/HierarchicalContextApplication.java
description: HierarchicalContextApplication.java notes
---

~~~java
package com.tutego.ch_02.beanLifeCycle.hierarchicalContext;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@SpringBootConfiguration
@EnableAutoConfiguration
public class HierarchicalContextApplication {

    @Configuration(proxyBeanMethods = false)
    @ComponentScan("com.tutego.ch_02.beanLifeCycle.hierarchicalContext.parent")
    public static class ParentConfig {}

    @Configuration(proxyBeanMethods = false)
    @ComponentScan("com.tutego.ch_02.beanLifeCycle.hierarchicalContext.child")
    public static class ChildConfig {}

    public static void main(String... args) {
        new SpringApplicationBuilder()
                .parent(ParentConfig.class)
                .child(ChildConfig.class)
                .run(args);
    }

}
~~~
