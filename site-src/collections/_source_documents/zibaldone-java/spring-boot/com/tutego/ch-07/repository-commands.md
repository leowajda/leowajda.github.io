---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: RepositoryCommands.java
tree_path: src/main/java/com/tutego/ch_07/RepositoryCommands.java
source_path: spring-boot/src/main/java/com/tutego/ch_07/RepositoryCommands.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_07/RepositoryCommands.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_07/RepositoryCommands.java
description: RepositoryCommands.java notes
---

~~~java
package com.tutego.ch_07;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.util.Lazy;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;

import java.util.List;
import java.util.Optional;

@ShellComponent
public class RepositoryCommands {

    private static final Logger logger = LoggerFactory.getLogger(RepositoryCommands.class);
    private static final int PAGE_SIZE = 1;
    private final ProfileRepository profiles;
    private Lazy<Page<Profile>> currentPage;

    public RepositoryCommands(ProfileRepository profiles) {
        this.profiles = profiles;
        currentPage = Lazy.of(() -> profiles.findAll(PageRequest.ofSize(PAGE_SIZE)));
    }

    @ShellMethod("Display all profiles")
    public List<Profile> list() {
        return currentPage.get().getContent();
    }

    @ShellMethod("Set current page to previous page, display the current page")
    public List<Profile> pp() {
        currentPage = currentPage.map(page -> profiles.findAll(page.previousOrFirstPageable()));
        return list();
    }

    @ShellMethod("Set current page to next page, display the current page")
    public List<Profile> np() {
        currentPage = currentPage.map(page -> profiles.findAll(page.nextOrLastPageable()));
        return list();
    }

    @ShellMethod
    public void example() {
        // useful at runtime
        ExampleMatcher.PropertyValueTransformer removeAllSpaces = optional -> optional
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .map(s -> s.replaceAll("\\s+", ""));

        var matcher = ExampleMatcher.matching()
                .withIgnorePaths("maneLength", "gender")
                .withMatcher(
                        "nickname",
                        m -> m.transform(removeAllSpaces).contains().ignoreCase()
                        /* OR ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase() */
                );

        var exampleProfile = new Profile();
        exampleProfile.setNickname("c      a"); // -> like '%ca%

        // if DB index is not picked by the planner this is a very bad query
        profiles.findAll(Example.of(exampleProfile, matcher), PageRequest.ofSize(PAGE_SIZE))
                .forEach(profile -> logger.info("{}", profile));
    }

    @ShellMethod("update")
    public Optional<Profile> update(long id) {
        profiles.findById(id).ifPresent(profile -> {
            logger.info("profile: {}", profile);
            profile.setNickname("King" + profile.getNickname() + "theGreat");
            profiles.save(profile); // Spring Data JPA takes care of defining the transactional boundaries
        });
        return profiles.findById(1L);
    }
}
~~~
