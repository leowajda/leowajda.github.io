---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: JdbcCommands.java
tree_path: src/main/java/com/tutego/ch_05/jdbcTemplate/JdbcCommands.java
source_path: spring-boot/src/main/java/com/tutego/ch_05/jdbcTemplate/JdbcCommands.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_05/jdbcTemplate/JdbcCommands.java
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
- label: jdbcTemplate
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_05/jdbcTemplate/JdbcCommands.java
description: JdbcCommands.java notes
---

~~~java
package com.tutego.ch_05.jdbcTemplate;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.DataClassRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;

import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.StringJoiner;

@ShellComponent
public class JdbcCommands {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public JdbcCommands(NamedParameterJdbcTemplate namedParameterJdbcTemplate /* just a wrapper */) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.jdbcTemplate = namedParameterJdbcTemplate.getJdbcTemplate();
    }

    @ShellMethod
    public String cast(String nickname) {
        var lengths = jdbcTemplate.queryForList(
                "SELECT manelength FROM Profile WHERE nickname = ?",
                Integer.class, // limited type support, not easily configurable
                nickname
        );

        return lengths.isEmpty() ? "Unknown profile for nickname " + nickname : lengths.get(0).toString();
    }

    @ShellMethod
    public String namedCast(String nickname) {
        var lengths = namedParameterJdbcTemplate.queryForList(
                "SELECT manelength FROM Profile WHERE nickname = :name",
                new MapSqlParameterSource().addValue("name", nickname), // limited type support, not easily configurable
                Integer.class
        );

        return lengths.isEmpty() ? "Unknown profile for nickname " + nickname : lengths.get(0).toString();
    }

    @ShellMethod
    public List<NicknameLastSeen> rowMapper(String lastSeen) {
        return jdbcTemplate.query(
                """ 
                        SELECT nickname, lastseen
                        FROM Profile WHERE lastseen > ?
                        ORDER BY lastseen
                        """,
                // RowMapper<T>
                (rs, rowNum) -> new NicknameLastSeen(
                        rs.getString("nickname"),
                        rs.getTimestamp("lastseen").toLocalDateTime()
                ),
                lastSeen
        );
    }

    @ShellMethod
    public List<NicknameLastSeen> dataClassRowMapper(String lastSeen) {
        return jdbcTemplate.query( // can also stream but the resource needs to be manually closed
                """ 
                        SELECT nickname AS name, lastseen AS seen
                        FROM Profile WHERE lastseen > ?
                        ORDER BY lastseen
                        """,
                // class DataClassRowMapper<T> extends BeanPropertyRowMapper<T>
                new DataClassRowMapper<>(NicknameLastSeen.class),
                lastSeen
        );
    }

    @ShellMethod
    public List<ProfilePhoto> beanPropertyRowMapper() {
        return jdbcTemplate.query(
                // name AS imageName necessary to invoke the correct JavaBean setter
                "SELECT id, name AS imageName FROM Photo WHERE is_profile_photo = TRUE",
                // class BeanPropertyRowMapper<T> implements RowMapper<T>
                new BeanPropertyRowMapper<>(ProfilePhoto.class)
        );
    }

    @ShellMethod
    public String rowCallbackHandler(int limit) {
        var sql = "SELECT nickname FROM Profile ORDER BY RAND() LIMIT ?";
        var joiner = new StringJoiner(", ", "Meet ", " and so many more!");

        jdbcTemplate.query(
                sql,
                rs -> {
                    // RowCallbackHandler (side-effect)
                    joiner.add(rs.getString("nickname"));
                }
                , limit
        );

        return joiner.toString();
    }

    @ShellMethod
    public String resultSetExtractor(int limit) {
        var sql = "SELECT nickname FROM Profile ORDER BY RAND() LIMIT ?";
        return jdbcTemplate.query(
                sql,
                rs -> {
                    // ResultSetExtractor
                    var joiner = new StringJoiner(", ", "Meet ", " and so many more!");
                    while (rs.next()) joiner.add(rs.getString("nickname"));
                    return joiner.toString();
                },
                limit
        );
    }

    @ShellMethod
    public long preparedStatementCreator(int profileFk, String name, boolean isProfilePhoto) {
        PreparedStatementCreator preparedStmtCreator = connection -> {
            var stmt = connection.prepareStatement(
                    "INSERT INTO Photo (profile_fk, name, is_profile_photo, created) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );

            stmt.setInt(1, profileFk);
            stmt.setString(2, name);
            stmt.setBoolean(3, isProfilePhoto);
            stmt.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
            return stmt;
        };
        KeyHolder keyHolder = new GeneratedKeyHolder(); // glorified ArrayList<> pointer
        jdbcTemplate.update(preparedStmtCreator, keyHolder);

        return keyHolder.getKey().longValue();
    }

}
~~~
