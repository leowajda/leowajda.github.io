---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: UserDetailsServiceConfig.java
tree_path: src/main/java/com/tutego/ch_09/security/UserDetailsServiceConfig.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/security/UserDetailsServiceConfig.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/security/UserDetailsServiceConfig.java
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
- label: security
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/security/UserDetailsServiceConfig.java
description: UserDetailsServiceConfig.java notes
---

~~~java
package com.tutego.ch_09.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
public class UserDetailsServiceConfig {

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> switch (username) {
            case "user" -> User
                    .withUsername(username)
                    .password("{noop}password") // {noop} tells the DelegatingPasswordEncoder that NoOpPasswordEncoder is to be used
                    .roles("USER")
                    .build();
            default -> throw new UsernameNotFoundException(username);
        };
    }

}
~~~
