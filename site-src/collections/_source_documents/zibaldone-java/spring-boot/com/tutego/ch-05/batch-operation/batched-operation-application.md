---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: BatchedOperationApplication.java
tree_path: src/main/java/com/tutego/ch_05/batchOperation/BatchedOperationApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_05/batchOperation/BatchedOperationApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_05/batchOperation/BatchedOperationApplication.java
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
- label: batchOperation
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_05/batchOperation/BatchedOperationApplication.java
description: BatchedOperationApplication.java notes
---

~~~java
package com.tutego.ch_05.batchOperation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ParameterizedPreparedStatementSetter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.support.AbstractInterruptibleBatchPreparedStatementSetter;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication(scanBasePackageClasses = BatchedOperationModule.class)
public class BatchedOperationApplication {

    private static final List<Photo> PHOTOS = List.of(
            new Photo(1, "test_a", false, LocalDateTime.now().minusHours(2)),
            new Photo(2, "test_b", false, LocalDateTime.now())
    );

    // very bad abstraction from Spring
    private static final BatchPreparedStatementSetter batchPreparedStatementSetter = new BatchPreparedStatementSetter() {
        @Override
        public int getBatchSize() {
            return PHOTOS.size();
        }

        @Override
        public void setValues(PreparedStatement ps, int index) throws SQLException {
            var photo = PHOTOS.get(index);

            ps.setLong(1, photo.profile());
            ps.setString(2, photo.name());
            ps.setBoolean(3, photo.isProfilePhoto());
            ps.setTimestamp(4, Timestamp.valueOf(photo.created()));
        }
    };

    // useful when the stream of data is of undefined size, the batch size is then internally set to Integer.MAX_VALUE
    private static final AbstractInterruptibleBatchPreparedStatementSetter interruptibleBatchPreparedStatementSetter = new AbstractInterruptibleBatchPreparedStatementSetter() {
        @Override
        protected boolean setValuesIfAvailable(PreparedStatement ps, int i) throws SQLException {
            if (i >= PHOTOS.size())
                return false;

            batchPreparedStatementSetter.setValues(ps, i);
            return true;
        }
    };

    private static final ParameterizedPreparedStatementSetter<Photo> parameterizedPreparedStatementSetter = (ps, photo) -> {
        ps.setLong(1, photo.profile());
        ps.setString(2, photo.name());
        ps.setBoolean(3, photo.isProfilePhoto());
        ps.setTimestamp(4, Timestamp.valueOf(photo.created()));
    };

    public BatchedOperationApplication(JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedJdbcTemplate) {
        var sql = "INSERT INTO photo (profile_fk, name, is_profile_photo, created) VALUES (?, ?, ?, ?)";

        jdbcTemplate.batchUpdate(
                sql,
                batchPreparedStatementSetter
        );

        jdbcTemplate.batchUpdate(
                sql,
                interruptibleBatchPreparedStatementSetter
        );

        jdbcTemplate.batchUpdate(
                sql,
                PHOTOS,
                PHOTOS.size(),
                parameterizedPreparedStatementSetter
        );

        var args = PHOTOS.stream()
                .map(photo -> new MapSqlParameterSource()
                        .addValue("profile", photo.profile())
                        .addValue("name", photo.name())
                        .addValue("is_profile_photo", photo.isProfilePhoto())
                        .addValue("created", photo.created()))
                .toArray(MapSqlParameterSource[]::new);


        // the NamedParameterJdbcTemplate algebra is wildly different from the JdbcTemplate api
        namedJdbcTemplate.batchUpdate(
                "INSERT INTO photo (profile_fk, name, is_profile_photo, created) VALUES (:profile, :name, :is_profile_photo, :created)",
                args
        );
    }

    public static void main(String... args) {
        SpringApplication.run(BatchedOperationApplication.class, args);
    }

}
~~~
