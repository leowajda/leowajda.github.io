---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: SpringWebSupportController.java
tree_path: src/main/java/com/tutego/ch_09/webSupport/SpringWebSupportController.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/webSupport/SpringWebSupportController.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/webSupport/SpringWebSupportController.java
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
- label: webSupport
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/webSupport/SpringWebSupportController.java
description: SpringWebSupportController.java notes
---

~~~java
package com.tutego.ch_09.webSupport;

import com.tutego.ch_07.Profile;
import com.tutego.ch_07.ProfileRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
public class SpringWebSupportController {

    private final ProfileRepository profiles;

    public SpringWebSupportController(ProfileRepository profiles) {
        this.profiles = profiles;
    }

    /*
     * 1. Automatically identifies the corresponding repository (in this case, ProfileRepository)
     * 2. Extracts the ID from the path variable or query parameter
     * 3. Retrieves the entity bean using the findById(…) method (or its equivalent)
     * 4. Initializes the parameter variable (in this case, profile) with the retrieved entity bean
     */
    @GetMapping("/{id}")
    public ResponseEntity<Profile> get(@PathVariable("id") Optional<Profile> profile) {
        return ResponseEntity.of(profile);
    }

    /*
     * ?page=2
     * ?page=2&size=5
     * ?page=2&size=5&sort=maneLength,desc
     * ?page=2&size=5&sort=maneLength,desc&sort=nickname,asc
     */
    @GetMapping("pageable")
    public List<Profile> profilesWithDefaultPageable(@PageableDefault(size = 5, sort = "nickname") Pageable pageable) {
        return profiles.findAll(pageable).toList();
    }

    /*

    @GetMapping("/search")
    public Page<Profile> search(
            @QuerydslPredicate(root = Profile.class) Predicate predicate, <-- QueryDsl 'extension' method
            @PageableDefault(size = 50, sort = "id") Pageable pageable
    ) {
        return profiles.findAll(predicate, pageable);
    }

    */

}
~~~
