---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: Unicorn.java
tree_path: src/main/java/com/tutego/ch_06/advanced/Unicorn.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/advanced/Unicorn.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/advanced/Unicorn.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_06/advanced/Unicorn.java
description: Unicorn.java notes
---

~~~java
package com.tutego.ch_06.advanced;

import com.tutego.ch_06.read.Profile;
import jakarta.persistence.*;

@Entity
@Access(AccessType.FIELD)
public class Unicorn extends AbstractEntity {

    @Embedded
    @AttributeOverrides(
            value = {
                    @AttributeOverride(name = "email", column = @Column(name = "email")),
                    @AttributeOverride(name = "password", column = @Column(name = "password"))
            }
    )
    private LoginCredentials credentials;

    @OneToOne
    @JoinColumn(name = "profile_fk") // loaded eagerly
    private Profile profile;


    @Override
    public String toString() {
        return "Unicorn{" +
                "credentials=" + credentials +
                ", profile=" + profile +
                '}';
    }
}
~~~
