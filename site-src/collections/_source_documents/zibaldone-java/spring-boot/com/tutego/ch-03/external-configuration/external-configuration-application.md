---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ExternalConfigurationApplication.java
tree_path: src/main/java/com/tutego/ch_03/externalConfiguration/ExternalConfigurationApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/externalConfiguration/ExternalConfigurationApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/externalConfiguration/ExternalConfigurationApplication.java
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
- label: ch_03
  url: ''
- label: externalConfiguration
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_03/externalConfiguration/ExternalConfigurationApplication.java
description: ExternalConfigurationApplication.java notes
---

~~~java
package com.tutego.ch_03.externalConfiguration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationPropertiesScan // looks for @ConfigurationProperties, works similarly to @ComponentScan
@SpringBootApplication(scanBasePackageClasses = ExternalConfigurationModule.class)
public class ExternalConfigurationApplication {

    private static final Logger logger = LoggerFactory.getLogger(ExternalConfigurationApplication.class);

    public static void main(String... args) {
        var ctx = SpringApplication.run(ExternalConfigurationApplication.class, args);
        var env = ctx.getEnvironment();

        env.getPropertySources()
                .forEach(propSource -> logger.info("{}= \n{}", propSource, propSource.getSource()));

        logger.info("secure-random.int={}", env.getProperty("secure-random.int"));
        logger.info("secure-random.long={}", env.getProperty("secure-random.long"));

    }
}
~~~
