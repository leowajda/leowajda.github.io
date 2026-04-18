---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: DependencyInjectionApplication.java
tree_path: src/main/java/com/tutego/ch_02/dependencyInjection/DependencyInjectionApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/dependencyInjection/DependencyInjectionApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/dependencyInjection/DependencyInjectionApplication.java
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
- label: dependencyInjection
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/dependencyInjection/DependencyInjectionApplication.java
description: DependencyInjectionApplication.java notes
---

~~~java
package com.tutego.ch_02.dependencyInjection;

import com.tutego.ch_02.classpathScanning.ClassPathScanning;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackageClasses = {DependencyInjection.class, ClassPathScanning.class})
public class DependencyInjectionApplication {

    public static void main(String... args) {
        SpringApplication.run(DependencyInjectionApplication.class, args);
    }
}
~~~
