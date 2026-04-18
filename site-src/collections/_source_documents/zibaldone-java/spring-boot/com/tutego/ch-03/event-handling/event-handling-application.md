---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: EventHandlingApplication.java
tree_path: src/main/java/com/tutego/ch_03/eventHandling/EventHandlingApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/eventHandling/EventHandlingApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/eventHandling/EventHandlingApplication.java
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
- label: eventHandling
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_03/eventHandling/EventHandlingApplication.java
description: EventHandlingApplication.java notes
---

~~~java
package com.tutego.ch_03.eventHandling;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ExitCodeExceptionMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.ApplicationPidFileWriter;
import org.springframework.boot.system.ApplicationPid;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@SpringBootApplication(scanBasePackageClasses = EventHandlingModule.class)
public class EventHandlingApplication {

    private static final Logger logger = LoggerFactory.getLogger(EventHandlingApplication.class);

    public static void main(String... args) throws IOException {
        var app = new SpringApplication(EventHandlingApplication.class);
        app.setDefaultProperties(Map.of("spring.pid.fail-on-write-error", true));
        app.addListeners(new ApplicationPidFileWriter() /* file gets deleted on exit and created on startup */);

        var ctx = app.run(args);
        logger.info("ApplicationPid: {}", new ApplicationPid());

        var applicationPidContent = Files.lines(Paths.get("application.pid")).collect(Collectors.joining("\n"));
        logger.info("ApplicationPidFileWriter content: {}", applicationPidContent);

        var exitCode = SpringApplication.exit(ctx, () -> {
            logger.info("ExitCodeGenerator is being invoked");
            return 2;
        });

        logger.info("manually invoking System.exit({})", exitCode);
        System.exit(exitCode);
    }

    @Bean // maps runtime exceptions into exit codes
    public ExitCodeExceptionMapper exitCodeExceptionMapper() {
        return exception -> exception instanceof RuntimeException ? 255 : 0;
    }

    @Bean // runs after the Spring container has been successfully created
    public ApplicationRunner runAtStartTime() {
        return args -> {
            logger.info("nonOptionArgs={}", args.getNonOptionArgs());
            logger.info("optionNames={}", args.getOptionNames());
            logger.info("sourceArgs={}", Arrays.toString(args.getSourceArgs()));
            logger.info("optionNames={}", args.getOptionNames().stream().map(args::getOptionValues).toList());
        };
    }

}
~~~
