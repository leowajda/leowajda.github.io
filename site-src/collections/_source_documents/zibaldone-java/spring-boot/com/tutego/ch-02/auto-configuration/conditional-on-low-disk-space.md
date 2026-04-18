---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ConditionalOnLowDiskSpace.java
tree_path: src/main/java/com/tutego/ch_02/autoConfiguration/ConditionalOnLowDiskSpace.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/ConditionalOnLowDiskSpace.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/ConditionalOnLowDiskSpace.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_02/autoConfiguration/ConditionalOnLowDiskSpace.java
description: ConditionalOnLowDiskSpace.java notes
---

~~~java
package com.tutego.ch_02.autoConfiguration;

import org.springframework.context.annotation.Conditional;

import java.lang.annotation.*;


/*
* @ConditionalOnProperty
* This tests if a certain property is set or has a certain value.
* Then, the match is valid, and a new bean is created.
*
* @ConditionalOnBean, @ConditionalOnMissingBean
* If a bean of a certain type exists, then another bean can be generated.
* The other way round also works @ConditionalOnMissingBean.
*
* @ConditionalOnSingleCandidate
* There could be multiple Spring-managed beans of a desired type.
* @ConditionalOnSingleCandidate becomes active if there is exactly one candidate for a type.
*
* @ConditionalOnExpression
* This allows us to write any expression of the Spring Expression Language (SpEL).
* And if this expression is true, a Spring-managed bean is created.
*
* @ConditionalOnJava
* This allows us to query Java versions.
*
* @ConditionalOnJndi
* This allows us to find out whether certain Java Naming and Directory Interface (JDNI) resources are available.
*
* @ConditionalOnWebApplication, @ConditionalOnNotWebApplication
* This checks if we’re in a web application.
*
* @ConditionalOnResource
* This checks if a certain resource is available.
*
* @ConditionalOnCloudPlatform
* This allows us to ask if the application is running on a specific cloud platform.
*
* @ConditionalOnWarDeployment
* This checks if we have a web application resource (WAR) file deployment for a servlet container, for example.
* If the application runs in the embedded server, this condition will return false.
*/
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
@Documented
@Conditional(LowDiskSpaceCondition.class)
public @interface ConditionalOnLowDiskSpace { }
~~~
