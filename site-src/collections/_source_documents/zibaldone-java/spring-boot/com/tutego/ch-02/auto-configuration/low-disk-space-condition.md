---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: LowDiskSpaceCondition.java
tree_path: src/main/java/com/tutego/ch_02/autoConfiguration/LowDiskSpaceCondition.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/LowDiskSpaceCondition.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/LowDiskSpaceCondition.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_02/autoConfiguration/LowDiskSpaceCondition.java
description: LowDiskSpaceCondition.java notes
---

~~~java
package com.tutego.ch_02.autoConfiguration;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.unit.DataSize;

import java.io.File;

public class LowDiskSpaceCondition implements Condition {

    @Override
    public boolean matches(ConditionContext ctx, AnnotatedTypeMetadata metadata) {
        return DataSize.ofBytes(new File("/").getFreeSpace()).toGigabytes() < 10;
    }

}
~~~
