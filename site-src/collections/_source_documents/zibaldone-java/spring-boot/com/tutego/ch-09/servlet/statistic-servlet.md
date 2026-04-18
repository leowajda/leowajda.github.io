---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: StatisticServlet.java
tree_path: src/main/java/com/tutego/ch_09/servlet/StatisticServlet.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/servlet/StatisticServlet.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/servlet/StatisticServlet.java
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
- label: servlet
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/servlet/StatisticServlet.java
description: StatisticServlet.java notes
---

~~~java
package com.tutego.ch_09.servlet;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

// can also be registered via @WebServlet + @ServletComponentScan
public class StatisticServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.getWriter().write("123456");
    }

}
~~~
