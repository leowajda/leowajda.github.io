---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: LoginCredentials.java
tree_path: src/main/java/com/tutego/ch_06/advanced/LoginCredentials.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/advanced/LoginCredentials.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/advanced/LoginCredentials.java
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
- label: ch_06
  url: ''
- label: advanced
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_06/advanced/LoginCredentials.java
description: LoginCredentials.java notes
---

~~~java
package com.tutego.ch_06.advanced;

import jakarta.persistence.Embeddable;

// @Embeddable is always associated with a specific entity (like in the case of a composite key);
// the @Entity @Access policy cascades to @Embeddable types as well.
@Embeddable
public class LoginCredentials {
    private String email;
    private String password;

    @Override
    public String toString() {
        return "LoginCredentials{" +
                "email='" + email + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
~~~
