---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: CustomTypeFilter.java
tree_path: src/main/java/com/tutego/ch_02/classpathScanning/CustomTypeFilter.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/classpathScanning/CustomTypeFilter.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/classpathScanning/CustomTypeFilter.java
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
- label: classpathScanning
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/classpathScanning/CustomTypeFilter.java
description: CustomTypeFilter.java notes
---

~~~java
package com.tutego.ch_02.classpathScanning;

import org.springframework.core.type.ClassMetadata;
import org.springframework.core.type.classreading.MetadataReader;
import org.springframework.core.type.classreading.MetadataReaderFactory;
import org.springframework.core.type.filter.TypeFilter;

import java.io.IOException;

public class CustomTypeFilter implements TypeFilter {
    @Override
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) throws IOException {
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
        return classMetadata.hasEnclosingClass() && classMetadata.isFinal();
    }

    static final class InnerFinalClass {}

}
~~~
