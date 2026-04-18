---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: QuoteNotFoundException.java
tree_path: src/main/java/com/tutego/ch_09/errorHandling/QuoteNotFoundException.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/errorHandling/QuoteNotFoundException.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/errorHandling/QuoteNotFoundException.java
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
- label: errorHandling
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/errorHandling/QuoteNotFoundException.java
description: QuoteNotFoundException.java notes
---

~~~java
package com.tutego.ch_09.errorHandling;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// not flexible at runtime
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No such quote")
public class QuoteNotFoundException extends RuntimeException { }
~~~
