---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ThumbnailRendering.java
tree_path: src/main/java/com/tutego/ch_02/beanQualification/thumbnail/ThumbnailRendering.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/beanQualification/thumbnail/ThumbnailRendering.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/beanQualification/thumbnail/ThumbnailRendering.java
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
- label: beanQualification
  url: ''
- label: thumbnail
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/beanQualification/thumbnail/ThumbnailRendering.java
description: ThumbnailRendering.java notes
---

~~~java
package com.tutego.ch_02.beanQualification.thumbnail;

import org.springframework.beans.factory.annotation.Qualifier;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Qualifier
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.TYPE, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ThumbnailRendering {
    enum RenderingQuality {FAST, QUALITY}

    RenderingQuality value();
}
~~~
