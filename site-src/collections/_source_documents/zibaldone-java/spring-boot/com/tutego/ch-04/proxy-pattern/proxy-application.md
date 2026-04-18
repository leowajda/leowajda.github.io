---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ProxyApplication.java
tree_path: src/main/java/com/tutego/ch_04/proxyPattern/ProxyApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_04/proxyPattern/ProxyApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_04/proxyPattern/ProxyApplication.java
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
- label: ch_04
  url: ''
- label: proxyPattern
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_04/proxyPattern/ProxyApplication.java
description: ProxyApplication.java notes
---

~~~java
package com.tutego.ch_04.proxyPattern;

import org.aopalliance.intercept.MethodInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.ProxyFactory;

import java.util.ArrayList;
import java.util.List;

import static java.util.Objects.isNull;

public class ProxyApplication {

    private static final Logger logger = LoggerFactory.getLogger(ProxyApplication.class);

    public static void main(String... args) {
        ProxyFactory factory = new ProxyFactory(new ArrayList<>());

        MethodInterceptor methodInterceptor = invocation -> {
            if (invocation.getMethod().getName().equals("add") && isNull(invocation.getArguments()[0])) {
                logger.info("proxy has intercepted invalid method call");
                return false;
            }
            return invocation.proceed();
        };

        factory.addAdvice(methodInterceptor);

        List unsafeList = (List) factory.getProxy();
        unsafeList.add("One");
        logger.info("unsafeList contents: {}", unsafeList);
        unsafeList.add(null);
        unsafeList.add("Two");
        logger.info("unsafeList contents: {}", unsafeList);
    }

}
~~~
