---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ProfileSpecifications.java
tree_path: src/main/java/com/tutego/ch_07/ProfileSpecifications.java
source_path: spring-boot/src/main/java/com/tutego/ch_07/ProfileSpecifications.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_07/ProfileSpecifications.java
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
- label: ch_07
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_07/ProfileSpecifications.java
description: ProfileSpecifications.java notes
---

~~~java
package com.tutego.ch_07;

import jakarta.persistence.criteria.Expression;
import org.springframework.data.jpa.domain.Specification;

public class ProfileSpecifications {

    // a limited version of doobie fragments (only covers the use case for criteria)
    public static final Specification<Profile> longMane = (root, query, builder) ->
            builder.greaterThanOrEqualTo(root.get("maneLength"), "10");

    public static final Specification<Profile> nameContainsFat = (root, query, builder) -> {
        Expression<String> nickname = root.get("nickname");
        Expression<String> lowerName = builder.lower(nickname);
        return builder.like(lowerName, "%fat%");
    };

    public static Specification<Profile> longMane(int length) {
        return (root, query, builder) ->
                builder.greaterThanOrEqualTo(root.get("maneLength"), (short) length);
    }

}
~~~
