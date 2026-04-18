---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: ProfileRepository.java
tree_path: src/main/java/com/tutego/ch_07/ProfileRepository.java
source_path: spring-boot/src/main/java/com/tutego/ch_07/ProfileRepository.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_07/ProfileRepository.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_07/ProfileRepository.java
description: ProfileRepository.java notes
---

~~~java
package com.tutego.ch_07;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.scheduling.annotation.Async;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

// public interface JpaRepository<T, ID> extends ListCrudRepository<T, ID>, ListPagingAndSortingRepository<T, ID>, QueryByExampleExecutor<T>
public interface ProfileRepository extends JpaRepository<Profile, Long>, JpaSpecificationExecutor<Profile> {

    @Query("SELECT p FROM Profile p WHERE p.lastSeen > :lastSeen")
    List<Profile> findProfilesLastSeenAfter(LocalDateTime lastSeen);
    /* findProfilesLastSeenAfter(@Param("lastSeen") LocalDateTime timestamp ); */

    @Query("SELECT p FROM Profile p WHERE p.nickname = :name")
    Optional<Profile> findProfileByNickname(String name);

    @Query("SELECT p FROM Profile p WHERE p.nickname LIKE %:name%")
    List<Profile> findProfilesByContainingName(String name);

    @Query("SELECT p FROM Profile p WHERE p.maneLength BETWEEN :min AND :max")
    List<Profile> findProfilesByManeLengthBetween(short min, short max);

    @Modifying // requires a @Transactional context to run
    @Query("UPDATE Profile p SET p.lastSeen = :lastSeen WHERE p.id = :id")
    int updateLastSeen(long id, LocalDateTime lastSeen);

    @Query("SELECT p FROM Profile p WHERE p.attractedToGender IN :genders")
    List<Profile> findProfilesAttractedToGender(Byte... genders);

    @Query("SELECT p.id as id, p.nickname as nickname FROM Profile p WHERE id=:id")
    Map<String, Object> findSimplifiedProfile(long id);

    @Query("SELECT p.id as id, p.nickname as nickname FROM Profile p")
    List<Map<String, Object>> findAllSimplifiedProfiles();

    @Query("SELECT p FROM Profile p WHERE p.lastSeen > :lastSeen")
        // no need to embed into the name the ordering
    List<Profile> findProfilesLastSeenAfter(LocalDateTime lastSeen, Sort sort);

    @Query("SELECT p FROM Profile p WHERE p.lastSeen > :lastSeen")
    Page<Profile> findProfilesLastSeenAfter(LocalDateTime lastSeen, Pageable p);

    @Query(
            value = "SELECT * FROM Profile WHERE maneLength > ?1",
            nativeQuery = true /* used for distinguishing native queries */,
            countQuery = "SELECT count(*) FROM … WHERE …" // if JPA is not able to correctly generate the right COUNT query
    )
    List<Profile> findProfilesWithManeLengthGreaterThan(short maneLength, Pageable p /* can still pass Pageable */);

    // no need for @Query
    Optional<Profile> findFirstByOrderByManeLengthDesc();

    List<Profile> findByOrderByManeLengthDesc();

    List<Profile> findByManeLengthGreaterThan(short min);

    List<Profile> findFirst10ByOrderByLastSeenDesc();

    @Async
    CompletableFuture<Profile> findByNickname(String nickname);
}
~~~
