---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: JakartaPersistenceWriteApplication.java
tree_path: src/main/java/com/tutego/ch_06/write/JakartaPersistenceWriteApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/write/JakartaPersistenceWriteApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/write/JakartaPersistenceWriteApplication.java
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
- label: write
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_06/write/JakartaPersistenceWriteApplication.java
description: JakartaPersistenceWriteApplication.java notes
---

~~~java
package com.tutego.ch_06.write;

import com.tutego.ch_06.read.JakartaPersistenceReadModule;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(
        scanBasePackageClasses = {
                JakartaPersistenceWriteModule.class,
                JakartaPersistenceReadModule.class
})
public class JakartaPersistenceWriteApplication {

    public static void main(String... args) {
        SpringApplication.run(JakartaPersistenceWriteApplication.class, args);
    }

}
~~~
