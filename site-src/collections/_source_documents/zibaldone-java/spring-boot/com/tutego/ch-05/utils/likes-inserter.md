---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: LikesInserter.java
tree_path: src/main/java/com/tutego/ch_05/utils/LikesInserter.java
source_path: spring-boot/src/main/java/com/tutego/ch_05/utils/LikesInserter.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_05/utils/LikesInserter.java
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
- label: ch_05
  url: ''
- label: utils
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_05/utils/LikesInserter.java
description: LikesInserter.java notes
---

~~~java
package com.tutego.ch_05.utils;

import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.util.Map;

@Repository
class LikesInserter {
    private final SimpleJdbcInsert jdbcInsertLikes;

    public LikesInserter(DataSource dataSource) {
        jdbcInsertLikes = new SimpleJdbcInsert(dataSource).withTableName("Likes");
    }

    // KeyHolder, Void, or Number
    public KeyHolder addLike(long liker, long likee) {
        return jdbcInsertLikes.executeAndReturnKeyHolder(Map.of("liker_fk", liker, "likee_fk", likee));
    }

    // number of rows affected by every insert in the batch
    @SuppressWarnings("unchecked")
    public int[] addLikes(Map<String, ?> likes) {
        return jdbcInsertLikes.executeBatch(likes);
    }


}
~~~
