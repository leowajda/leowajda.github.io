---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: TempCleaner.java
tree_path: src/main/java/com/tutego/ch_02/autoConfiguration/TempCleaner.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/TempCleaner.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/TempCleaner.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_02/autoConfiguration/TempCleaner.java
description: TempCleaner.java notes
---

~~~java
package com.tutego.ch_02.autoConfiguration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ConditionalOnLowDiskSpace
class TempCleaner {

    private final Logger log = LoggerFactory.getLogger(getClass());

    public TempCleaner() {
        log.info("Cleaning temp directory to acquire more free disk space");
    }
}
~~~
