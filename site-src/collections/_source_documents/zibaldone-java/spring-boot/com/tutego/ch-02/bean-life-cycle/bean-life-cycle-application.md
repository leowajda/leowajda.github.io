---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: BeanLifeCycleApplication.java
tree_path: src/main/java/com/tutego/ch_02/beanLifeCycle/BeanLifeCycleApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/beanLifeCycle/BeanLifeCycleApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/beanLifeCycle/BeanLifeCycleApplication.java
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
- label: beanLifeCycle
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/beanLifeCycle/BeanLifeCycleApplication.java
description: BeanLifeCycleApplication.java notes
---

~~~java
package com.tutego.ch_02.beanLifeCycle;


import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;

import java.io.IOException;
import java.lang.annotation.Retention;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.time.LocalDate;

import java.lang.annotation.RetentionPolicy;

/*
 * By default, Spring eagerly evaluates the dependency graph.
 * @Component or @Bean might be marked as @Lazy for lazy evaluation.
 * Improve start-up time at the cost of errors in later stages of the application
 */
@SpringBootApplication(scanBasePackageClasses = BeanLifeCycleModule.class)
public class BeanLifeCycleApplication {
    public static void main(String... args) throws IOException {

        var server = HttpServer.create(new InetSocketAddress(9999), 0);

        // Once the application context has been built, the Spring components can be registered in other frameworks as well
        SpringApplication.run(BeanLifeCycleApplication.class, args)
                .getBeansWithAnnotation(ForeignInteroperabilityLayer.class)
                .forEach((__, handler) ->
                        server.createContext(
                                handler.getClass().getAnnotation(ForeignInteroperabilityLayer.class).value(),
                                (HttpHandler) handler)
                );

        server.start();
    }
}

@Controller
@Retention(RetentionPolicy.RUNTIME)
@interface ForeignInteroperabilityLayer {
    String value() default "/";
}


@ForeignInteroperabilityLayer("/date")
final class DateHandler implements HttpHandler {
    public void handle(HttpExchange t) throws IOException {
        t.sendResponseHeaders(HttpURLConnection.HTTP_OK, 0);
        try (var os = t.getResponseBody()) {
            os.write(LocalDate.now().toString().getBytes());
        }
    }
}
~~~
