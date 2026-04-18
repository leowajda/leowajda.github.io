---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: PromptProviderConfig.java
tree_path: src/main/java/com/tutego/ch_02/configurationClasses/PromptProviderConfig.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/configurationClasses/PromptProviderConfig.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/configurationClasses/PromptProviderConfig.java
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
- label: ch_02
  url: ''
- label: configurationClasses
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/configurationClasses/PromptProviderConfig.java
description: PromptProviderConfig.java notes
---

~~~java
package com.tutego.ch_02.configurationClasses;

import org.jline.utils.AttributedString;
import org.jline.utils.AttributedStyle;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.shell.jline.PromptProvider;

import java.util.UUID;

/*
* @Component relies on static graph resolution but some beans might require some more flexibility in terms of configuration.
* When using @Configuration Spring will create a proxy object to guarantee correctness (internally the proxy memoizes the bean method evaluations)
* Proxies can be disabled for easier native compilation, but it will only work correctly for decoupled beans (!!)
*/
@Configuration(proxyBeanMethods = false)
public class PromptProviderConfig {

    private static final PromptProvider USER_PROMPT_PROVIDER =
            () -> new AttributedString("date4u:>");

    private static final PromptProvider ADMIN_PROMPT_PROVIDER =
            () -> new AttributedString(
                    "date4u[admin]:>",
                    AttributedStyle.DEFAULT.foreground(AttributedStyle.RED)
            );

    @Bean // instantiated once at the beginning of the application, just like any other component
    public PromptProvider promptProvider(Environment env) {
        return env.containsProperty("admin") ? ADMIN_PROMPT_PROVIDER : USER_PROMPT_PROVIDER;
    }

    @Bean // instantiating several components of the same type isn't a problem, injection is.
    public UUID a() {
        return UUID.randomUUID();
    }

    @Bean
    public UUID b() {
        return UUID.randomUUID();
    }

}
~~~
