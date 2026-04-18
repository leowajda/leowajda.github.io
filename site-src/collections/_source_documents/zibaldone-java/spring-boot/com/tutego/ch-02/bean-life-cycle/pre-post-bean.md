---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: PrePostBean.java
tree_path: src/main/java/com/tutego/ch_02/beanLifeCycle/PrePostBean.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/beanLifeCycle/PrePostBean.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/beanLifeCycle/PrePostBean.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_02/beanLifeCycle/PrePostBean.java
description: PrePostBean.java notes
---

~~~java
package com.tutego.ch_02.beanLifeCycle;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PrePostBean {

    private static final Logger logger = LoggerFactory.getLogger(PrePostBean.class);

    private class Foo {
        private void initMethod() {
            logger.info("initMethod call for bean: " + Foo.class.getName());
        }

        private void destroyMethod() {
            logger.info("destroyMethod call for bean: " + Foo.class.getName());
        }
    }

    @Bean(initMethod = "initMethod", destroyMethod = "destroyMethod")
    public Foo uuid() {
        return new Foo();
    }


}
~~~
