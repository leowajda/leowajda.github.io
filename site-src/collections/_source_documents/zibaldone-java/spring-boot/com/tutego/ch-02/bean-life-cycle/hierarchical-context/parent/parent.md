---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: Parent.java
tree_path: src/main/java/com/tutego/ch_02/beanLifeCycle/hierarchicalContext/parent/Parent.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/beanLifeCycle/hierarchicalContext/parent/Parent.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/beanLifeCycle/hierarchicalContext/parent/Parent.java
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
- label: parent
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/beanLifeCycle/hierarchicalContext/parent/Parent.java
description: Parent.java notes
---

~~~java
package com.tutego.ch_02.beanLifeCycle.hierarchicalContext.parent;

import org.springframework.stereotype.Component;

@Component
public class Parent {

    // hierarchical context makes such a wiring illegal
    // @Autowired private Child child;
}
~~~
