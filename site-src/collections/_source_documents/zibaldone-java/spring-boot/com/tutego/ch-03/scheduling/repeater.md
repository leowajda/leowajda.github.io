---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: Repeater.java
tree_path: src/main/java/com/tutego/ch_03/scheduling/Repeater.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/scheduling/Repeater.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/scheduling/Repeater.java
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
- label: scheduling
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_03/scheduling/Repeater.java
description: Repeater.java notes
---

~~~java
package com.tutego.ch_03.scheduling;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class Repeater {

    private static final Logger logger = LoggerFactory.getLogger(Repeater.class);

    // The method annotated with @Scheduled must not have a parameter list.
    // Spring calls the method and passes nothing to the method; auto-wiring of parameters is also not possible.
    // The method doesn’t return anything because there’s nowhere for the results to go (side effects only).
    @Scheduled(
            timeUnit = TimeUnit.SECONDS, // defaults to milliseconds
            initialDelay = 5,
            fixedDelay = 1,
            fixedRate = -1L // different from `fixedDelay` if the side effect takes longer than the `fixedDelay` to run
    )
    public void helloWorld() {
        logger.info("hello world");
    }

    // @daily / @midnight / @weekly / @monthly / @yearly macro syntax for expression Linux CronJobs
    @Scheduled(cron = "@hourly")
    public void cronMacro() {}

}
~~~
