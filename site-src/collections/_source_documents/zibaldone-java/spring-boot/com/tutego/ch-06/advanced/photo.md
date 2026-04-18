---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: Photo.java
tree_path: src/main/java/com/tutego/ch_06/advanced/Photo.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/advanced/Photo.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/advanced/Photo.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_06/advanced/Photo.java
description: Photo.java notes
---

~~~java
package com.tutego.ch_06.advanced;

import com.tutego.ch_06.read.Profile;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Access(AccessType.FIELD)
public class Photo extends AbstractEntity {

    @ManyToOne
    @JoinColumn(name = "profile_fk")
    private Profile profile;

    private String name;

    @Column(name = "is_profile_photo")
    private boolean isProfilePhoto;

    private LocalDateTime created;

    @Override
    public String toString() {
        return "Photo{" +
                "profile=" + profile +
                ", name='" + name + '\'' +
                ", isProfilePhoto=" + isProfilePhoto +
                ", created=" + created +
                '}';
    }
}
~~~
