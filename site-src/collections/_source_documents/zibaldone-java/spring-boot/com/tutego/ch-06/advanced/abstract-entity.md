---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: AbstractEntity.java
tree_path: src/main/java/com/tutego/ch_06/advanced/AbstractEntity.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/advanced/AbstractEntity.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/advanced/AbstractEntity.java
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
- label: ch_06
  url: ''
- label: advanced
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_06/advanced/AbstractEntity.java
description: AbstractEntity.java notes
---

~~~java
package com.tutego.ch_06.advanced;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

// the @Entity @Access policy cascades to @MappedSuperclass types as well
// similar to AbstractPersistable type (the ID generation policy is not that flexible there)
@MappedSuperclass
public abstract class AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

}
~~~
