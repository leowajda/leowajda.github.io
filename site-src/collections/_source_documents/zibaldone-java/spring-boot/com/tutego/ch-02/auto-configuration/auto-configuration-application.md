---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: AutoConfigurationApplication.java
tree_path: src/main/java/com/tutego/ch_02/autoConfiguration/AutoConfigurationApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/AutoConfigurationApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/autoConfiguration/AutoConfigurationApplication.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_02/autoConfiguration/AutoConfigurationApplication.java
description: AutoConfigurationApplication.java notes
---

~~~java
package com.tutego.ch_02.autoConfiguration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

@SpringBootApplication(
        scanBasePackageClasses = AutoConfigurationModule.class,
        exclude = { // selectively exclude some of the autoconfigured beans (improves start-up time)
                DataSourceAutoConfiguration.class,
                DataSourceTransactionManagerAutoConfiguration.class,
                HibernateJpaAutoConfiguration.class
        }
)
public class AutoConfigurationApplication {

    public static void main(String... args) {
        SpringApplication.run(AutoConfigurationApplication.class, args);
    }

}
~~~
