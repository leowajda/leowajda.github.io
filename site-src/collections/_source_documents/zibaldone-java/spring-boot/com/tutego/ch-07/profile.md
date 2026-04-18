---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: Profile.java
tree_path: src/main/java/com/tutego/ch_07/Profile.java
source_path: spring-boot/src/main/java/com/tutego/ch_07/Profile.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_07/Profile.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_07/Profile.java
description: Profile.java notes
---

~~~java
package com.tutego.ch_07;

import jakarta.persistence.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "PROFILE")
@Access(AccessType.FIELD)
@EntityListeners(AuditingEntityListener.class)
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nickname;

    private LocalDate birthdate;

    @Column(name = "manelength")
    private short maneLength;

    private byte gender;

    @Column(name = "attracted_to_gender")
    private Byte attractedToGender;

    private String description;

    @Column(name = "lastseen")
    private LocalDateTime lastSeen;

    /*          AUDITING

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime created;

    @Column(nullable = false)
    @LastModifiedDate
    private LocalDateTime updatedAt;

    */

    @Override
    public boolean equals(Object o) {
        return o instanceof Profile profile && Objects.equals(nickname, profile.getNickname());
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public Long getId() {
        return id;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(nickname);
    }

    @Override
    public String toString() {
        return "%s[id=%d]".formatted(getClass().getSimpleName(), id);
    }
}
~~~
