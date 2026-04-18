---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: Profile.java
tree_path: src/main/java/com/tutego/ch_06/read/Profile.java
source_path: spring-boot/src/main/java/com/tutego/ch_06/read/Profile.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_06/read/Profile.java
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
document_id: spring-boot:src/main/java/com/tutego/ch_06/read/Profile.java
description: Profile.java notes
---

~~~java
package com.tutego.ch_06.read;

import com.tutego.ch_06.advanced.Photo;
import com.tutego.ch_06.advanced.Unicorn;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Entity // entity bean class
@Table(name = "PROFILE") // case isn't relevant
@Access(AccessType.FIELD) // Jakarta Persistence provider is informed that the data is stored within the object’s variables instead of being accessed through setter/getter methods
@NamedQueries(
        value = {
                @NamedQuery(
                        name = "Profile.findAll",
                        query = "SELECT p FROM Profile AS p"
                ),
                @NamedQuery(
                        name = "Profile.findByNickname",
                        query = "SELECT p FROM Profile AS p WHERE p.nickname = :nickname"
                )
        }
)
@NamedNativeQueries( // uses SQL, not JPQL
        value = {
                @NamedNativeQuery(
                        name = "Profile.findFuzzyNickname",
                        query = "SELECT * FROM Profile WHERE SOUNDEX(nickname) = SOUNDEX(?)",
                        resultClass = Profile.class
                ),
                @NamedNativeQuery(
                        name = "Profile.containsTwoVowelsNickname",
                        query = "SELECT nickname, manelength FROM profile WHERE REGEXP_LIKE(nickname, '[aeiou]{2}', 'i')",
                        resultSetMapping = "tupleToShortProfile"
                )
        }
)
@SqlResultSetMappings(
        value = {
                @SqlResultSetMapping(
                        name = "tupleToShortProfile",
                        classes = {
                                @ConstructorResult(
                                        targetClass = ShortProfile.class,
                                        columns = {
                                                // name element references the name of a column in the SELECT list
                                                @ColumnResult(name = "nickname"),
                                                @ColumnResult(name = "manelength")
                                        }
                                )
                        }
                )
        }
)
public class Profile {

    @Id
    // GenerationType.UUID uses v4, a custom generator is required for v7
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nickname;

    private LocalDate birthdate;

    @Column(name = "manelength")
    private short maneLength;

    @Convert(converter = GenderConverter.class)
    private Gender gender;

    @Column(name = "attracted_to_gender")
    private Byte attractedToGender;

    private String description;

    @Column(name = "lastseen")
    private LocalDateTime lastSeen;

    @Transient
    private int meaningOfLife;

    // bi-directional mapping
    @OneToOne(mappedBy = "profile" /* Unicorn.profile */)
    private Unicorn unicorn;

    @OrderBy("created")
    @OneToMany(mappedBy = "profile", fetch = FetchType.EAGER)
    private List<Photo> photos;

    public void setManeLength(short maneLength) {
        this.maneLength = maneLength;
    }

    public short getManeLength() {
        return maneLength;
    }

    public String getNickname() {
        return nickname;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getBirthdate() {
        return birthdate;
    }

    public List<Photo> getPhotos() {
        return photos;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Profile profile && Objects.equals(nickname, profile.nickname);
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
