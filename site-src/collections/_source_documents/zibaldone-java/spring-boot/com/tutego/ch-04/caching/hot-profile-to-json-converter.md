---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: HotProfileToJsonConverter.java
tree_path: src/main/java/com/tutego/ch_04/caching/HotProfileToJsonConverter.java
source_path: spring-boot/src/main/java/com/tutego/ch_04/caching/HotProfileToJsonConverter.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_04/caching/HotProfileToJsonConverter.java
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
- label: ch_04
  url: ''
- label: caching
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_04/caching/HotProfileToJsonConverter.java
description: HotProfileToJsonConverter.java notes
---

~~~java
package com.tutego.ch_04.caching;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@CacheConfig(cacheNames = "json-hot-profiles") // avoids code duplication
public class HotProfileToJsonConverter {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Cacheable(
            condition = "#ids.size() > 1",
            unless = "#result.length() == 100",
            keyGenerator = "simpleKeyGenerator" // name of the bean that implements KeyGenerator
            // key = "#ids.hashCode()"
    )
    public String hotAsJson(List<Long> ids) {
        logger.info("Generating JSON for list {}", ids);
        return ids.stream().map(String::valueOf).collect(Collectors.joining(",", "[", "]"));
    }

    @CacheEvict
    public void removeHotAsJson(List<Long> ids /* manual cache eviction of individual entries */) {}

    @CacheEvict(allEntries = true /*  purges the entire cache */)
    public void removeAllHotAsJson() {}

}
~~~
