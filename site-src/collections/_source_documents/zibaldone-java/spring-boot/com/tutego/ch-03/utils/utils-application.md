---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: UtilsApplication.java
tree_path: src/main/java/com/tutego/ch_03/utils/UtilsApplication.java
source_path: spring-boot/src/main/java/com/tutego/ch_03/utils/UtilsApplication.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_03/utils/UtilsApplication.java
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
- label: ch_03
  url: ''
- label: utils
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_03/utils/UtilsApplication.java
description: UtilsApplication.java notes
---

~~~java
package com.tutego.ch_03.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.util.Optionals;
import org.springframework.data.util.StreamUtils;
import org.springframework.data.util.Streamable;
import org.springframework.util.Assert;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;

import java.nio.file.FileSystems;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@SpringBootApplication(scanBasePackageClasses = UtilsModule.class)
public class UtilsApplication {

    private static final Logger logger = LoggerFactory.getLogger(UtilsApplication.class);

    public static void main(String... args) {
        SpringApplication.run(UtilsApplication.class, args);

        // public interface MultiValueMap<K, V> extends Map<K, List<V>>
        // org.springframework.util.MultiValueMap
        MultiValueMap<String, String> multiValueMap = new LinkedMultiValueMap<>();
        multiValueMap.addAll("a", List.of("b", "c"));

        // org.springframework.util.Assert
        Assert.noNullElements(multiValueMap.get("a"), () -> "null values");

        // org.springframework.util.StringUtils
        var res = StringUtils.collectionToCommaDelimitedString(multiValueMap.get("a"));
        logger.info("content for entry 'a': {}", multiValueMap.get("a"));
        logger.info("commaDelimitedString: {}", res);

        // org.springframework.data.util.Optionals
        var tuple = Optionals.withBoth(Optional.of(40), Optional.of(2));
        var meaningOfLife = tuple.map(pair -> pair.getFirst() + pair.getSecond()).orElse(0);

        // org.springframework.data.util.Streamable
        var set = Streamable.of(FileSystems.getDefault().getRootDirectories())
                .map(String::valueOf)
                .and("cloud")
                .and("local")
                .toSet();
        logger.info("directories: {}", set);

        // org.springframework.data.util.StreamUtils
        var zippedStream = StreamUtils.zip(Stream.of(1, 2, 3), Stream.of("a", "b", "c"), (num, s) -> s.repeat(num)).toList();
        logger.info("zippedStream: {}", zippedStream);

    }
}
~~~
