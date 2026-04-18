---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: AsyncController.java
tree_path: src/main/java/com/tutego/ch_09/async/AsyncController.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/async/AsyncController.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/async/AsyncController.java
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
- label: ch_09
  url: ''
- label: async
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/async/AsyncController.java
description: AsyncController.java notes
---

~~~java
package com.tutego.ch_09.async;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.async.DeferredResult;
import org.springframework.web.context.request.async.WebAsyncTask;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.util.concurrent.Callable;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@RestController
public class AsyncController {

    private static final Logger logger = LoggerFactory.getLogger(AsyncController.class);

    // by default, Spring uses SimpleAsyncTaskExecutor, which creates a new thread per task
    @RequestMapping("/callable")
    public Callable<String> callable() {
        return () -> {
            logger.info("{}", Thread.currentThread());
            TimeUnit.SECONDS.sleep(10);
            return "done";
        };
    }

    @RequestMapping("/web-task-async")
    public WebAsyncTask<String> webAsyncTask() {
        return new WebAsyncTask<>(
                5_000L, /* can define a timeout */
                "can pass the executor name explicitly here",
                () -> {
                    logger.info("{}", Thread.currentThread());
                    TimeUnit.SECONDS.sleep(10);
                    return "done";
                }
        );
    }

    @RequestMapping("/deferred-async")
    public DeferredResult<String> deferredResultAsync() {
        // similar to IO.async_ in Scala
        var deferredResult = new DeferredResult<String>(5000L);

        new Thread(() -> {
            logger.info("{}", Thread.currentThread());
            try {
                TimeUnit.SECONDS.sleep(2);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            deferredResult.setResult("done");
        }).start();

        return deferredResult;
    }

    @RequestMapping("/streaming-response-body")
    public ResponseEntity<?> streamingResponseBodyAsync() {
        StreamingResponseBody streamingResponseBody = out -> {
            out.write((byte) '[');
            for (int i = 0; i < 100; i++) {
                String line = "{\"index\": %d, \"value\": %d},%n";
                byte[] bytes = line.formatted(i, ThreadLocalRandom.current().nextInt()).getBytes();
                out.write(bytes);
                out.flush();
                try {
                    TimeUnit.MILLISECONDS.sleep(100);
                } catch (InterruptedException ignored) {
                }
            }
            out.write((byte) ']');
        };
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=random.json")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(streamingResponseBody);
    }

}
~~~
