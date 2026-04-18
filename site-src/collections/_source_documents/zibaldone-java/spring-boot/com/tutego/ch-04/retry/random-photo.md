---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: RandomPhoto.java
tree_path: src/main/java/com/tutego/ch_04/retry/RandomPhoto.java
source_path: spring-boot/src/main/java/com/tutego/ch_04/retry/RandomPhoto.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_04/retry/RandomPhoto.java
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
- label: ch_04
  url: ''
- label: retry
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_04/retry/RandomPhoto.java
description: RandomPhoto.java notes
---

~~~java
package com.tutego.ch_04.retry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;

@Component
class RandomPhoto {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final int MAX_ATTEMPTS = 5;
    private int unsafeCounter = 1;

    public RandomPhoto() throws IOException {
        logger.info("RetryTemplate retry attempts");

        // somewhat easier to tinker
        var retryTemplate = RetryTemplate.builder()
                .maxAttempts(MAX_ATTEMPTS)
                .retryOn(IOException.class)
                .uniformRandomBackoff(100 /* ms */, 1000 /* ms */)
                .build();

        retryTemplate.execute(
                retryContext -> {
                    var json = this.receive("male");
                    // the declarative approach limits the Context exposure
                    if (retryContext.getRetryCount() == MAX_ATTEMPTS - 1) logger.info("RetryCallback<T, E> result: {}", json);
                    return json;
                },
                recoveryCallback -> {
                    logger.info("RecoveryCallback<T> call");
                    return "{}";
                }
        );

        unsafeCounter = 1;
        logger.info("Declarative retry attempts");
    }

    @Retryable(
            retryFor = IOException.class,
            noRetryFor = NullPointerException.class,
            maxAttempts = MAX_ATTEMPTS - 1,
            backoff = @Backoff(
                    delay = 500L,
                    multiplier = 0.25D,
                    random = true
            )
    )
    public String receive(String gender) throws IOException {
        logger.info("Attempts: {}", unsafeCounter++);
        if (unsafeCounter <= MAX_ATTEMPTS) throw new IOException("Not yet ready to serve");

        var url = "https://randomuser.me/api/?inc=picture&noinfo&gender=" + gender;
        try (var inputStream = URI.create(url).toURL().openStream()) {
            return StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
        }
    }

    // The Throwable first argument is optional (but a method without it will only be called if no others match).
    // Subsequent arguments are populated from the argument list of the failed method in order.
    @Recover
    public String fallback(IOException exception, String gender) {
        logger.info("Fallback for call 'receive(String {})' with exception {}", gender, exception.getMessage());
        return "{}";
    }

}
~~~
