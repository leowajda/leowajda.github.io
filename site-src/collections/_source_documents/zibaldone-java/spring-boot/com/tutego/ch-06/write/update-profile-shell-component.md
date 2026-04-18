---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: UpdateProfileShellComponent.java
tree_path: src/main/java/com/tutego/ch_06/write/UpdateProfileShellComponent.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/write/UpdateProfileShellComponent.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/write/UpdateProfileShellComponent.java
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
- label: write
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_06/write/UpdateProfileShellComponent.java
description: UpdateProfileShellComponent.java notes
---

~~~java
package com.tutego.ch_06.write;

import com.tutego.ch_06.read.Profile;
import jakarta.persistence.EntityManager;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@ShellComponent
public class UpdateProfileShellComponent {

    private final EntityManager entityManager;

    public UpdateProfileShellComponent(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    @ShellMethod("Set mane length of a given profile")
    public void updateManeLength(long id, short maneLength) {
        // Dirty checking is a transaction feature. No transaction = no automatic persistence of changes
        Optional.ofNullable(entityManager.find(Profile.class, id))
                .ifPresent(p -> p.setManeLength(maneLength));
    }
}
~~~
