---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ReadProfileShellComponent.java
tree_path: src/main/java/com/tutego/ch_06/read/ReadProfileShellComponent.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/read/ReadProfileShellComponent.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/read/ReadProfileShellComponent.java
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
- label: read
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_06/read/ReadProfileShellComponent.java
description: ReadProfileShellComponent.java notes
---

~~~java
package com.tutego.ch_06.read;

import jakarta.persistence.EntityManager;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;
import org.springframework.shell.table.BorderStyle;
import org.springframework.shell.table.TableBuilder;
import org.springframework.shell.table.TableModelBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ShellComponent
public class ReadProfileShellComponent {

    private static final int PAGE_SIZE = 10;
    private final EntityManager entityManager;

    public ReadProfileShellComponent(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @ShellMethod("Display profile")
    public String findProfile(long id) {
        return formatProfilesAsTable(
                Optional.ofNullable(entityManager.find(Profile.class, id))
                        .stream()
                        .toList()
        );
    }

    @ShellMethod("Display all profiles")
    public String findProfiles(int page) {
        return formatProfilesAsTable(
                entityManager
                        .createNamedQuery("Profile.findAll", Profile.class)
                        .setFirstResult(page * PAGE_SIZE) // set the position of the first result to retrieve
                        .setMaxResults(PAGE_SIZE) // set the maximum number of results to retrieve
                        .getResultList()
        );
    }

    @ShellMethod("Display profiles by SOUNDEX")
    public String findProfilesBySound(String nickname) {
        return formatProfilesAsTable(
                // Jakarta Persistence provider recognizes from the name that it’s a named native query
                entityManager.createNamedQuery("Profile.findFuzzyNickname", Profile.class)
                        .setParameter(1,nickname)
                        .getResultList()
        );
    }

    @ShellMethod("Display profiles with vowels")
    public String findProfilesWithVowels() {
        return formatShortProfilesAsTable(
                // Jakarta Persistence provider recognizes from the name that it’s a named native query
                entityManager.createNamedQuery("Profile.containsTwoVowelsNickname", ShortProfile.class)
                        .getResultList()
        );
    }

    @ShellMethod("Display short profiles")
    public String findShortProfiles() {
        return formatShortProfilesAsTable(
                entityManager // constructor expressions JPQL, EntityMager is not required to manage any beans
                        .createQuery("SELECT new com.tutego.ch_06.jakartaPersistence.ShortProfile(p.nickname, p.maneLength) FROM Profile AS p", ShortProfile.class)
                        .getResultList()
        );
    }

    @ShellMethod("Display profiles by birth date")
    public String findProfilesByBirthDate(LocalDate birthDate) {
        return formatProfilesAsTable(
                entityManager
                        .createQuery("SELECT p FROM Profile AS p WHERE p.birthdate BETWEEN :birthdate AND LOCAL DATE ORDER BY p.birthdate", Profile.class)
                        .setParameter("birthdate", birthDate)
                        .getResultList()
        );
    }

    private static String formatShortProfilesAsTable(List<ShortProfile> profiles) {
        var tableModel = profiles.stream().reduce(
                new TableModelBuilder<String>().addRow().addValue("Nickname").addValue("Mane length"),
                (builder, profile) ->
                        builder.addRow().addValue(profile.nickname()).addValue(String.valueOf(profile.maneLength())),
                (a, b) -> a
        );

        return new TableBuilder(tableModel.build())
                .addFullBorder(BorderStyle.fancy_light)
                .build()
                .render(100);
    }

    private static String formatProfilesAsTable(List<Profile> profiles) {
        var tableModel = profiles.stream().reduce(
                new TableModelBuilder<String>()
                        .addRow()
                        .addValue("ID")
                        .addValue("Mane length")
                        .addValue("Nickname")
                        .addValue("Birthdate"),
                (builder, profile) ->
                        builder
                                .addRow()
                                .addValue(String.valueOf(profile.getId()))
                                .addValue(String.valueOf(profile.getManeLength()))
                                .addValue(profile.getNickname())
                                .addValue(profile.getBirthdate().toString()),
                (b1, b2) -> b1
        );

        return new TableBuilder(tableModel.build())
                .addFullBorder(BorderStyle.fancy_light)
                .build()
                .render(100);
    }
}
~~~
