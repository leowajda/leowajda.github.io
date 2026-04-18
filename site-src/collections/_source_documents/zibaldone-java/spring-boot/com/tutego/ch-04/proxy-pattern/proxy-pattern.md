---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ProxyPattern.java
tree_path: src/main/java/com/tutego/ch_04/proxyPattern/ProxyPattern.java
source_path: spring-boot/src/main/java/com/tutego/ch_04/proxyPattern/ProxyPattern.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_04/proxyPattern/ProxyPattern.java
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
- label: proxyPattern
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_04/proxyPattern/ProxyPattern.java
description: ProxyPattern.java notes
---

~~~java
package com.tutego.ch_04.proxyPattern;

public class ProxyPattern {

    private static class Subject {
        public String operation(String input) {
            return input;
        }
    }

    private static class Proxy extends Subject {
        private final Subject subject;

        public Proxy(Subject subject) {
            this.subject = subject;
        }

        @Override
        public String operation(String input) {
            // Preprocess the input
            // ....

            var result = subject.operation(input);

            // Postprocess the result
            // ...

            return result;
        }
    }

}
~~~
