---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: FsCommands.java
tree_path: src/main/java/com/tutego/ch_02/dependencyInjection/FsCommands.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/dependencyInjection/FsCommands.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/dependencyInjection/FsCommands.java
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
- label: dependencyInjection
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/dependencyInjection/FsCommands.java
description: FsCommands.java notes
---

~~~java
package com.tutego.ch_02.dependencyInjection;

import com.tutego.ch_02.classpathScanning.Date4uApplication;
import com.tutego.ch_02.classpathScanning.FileSystem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.MessageSource;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ResourceLoader;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;
import org.springframework.util.unit.DataSize;

/*
 * Dependencies might be marked as:
 *
 *   - @Autowired(required = false)
 *   - @Nullable
 *   - Option<T>
 *   - ObjectProvider<T>
 *
 * To make them optional and relax the dependency constraints.
 */
@ShellComponent("fsCommandsWithDependencyInjection")
public class FsCommands {

    private static final Logger logger = LoggerFactory.getLogger(FsCommands.class);
    // private final FileSystem fs = new FileSystem(); <- manual injection

    @Autowired // <- field injection (won't work for static and final variables)
    private FileSystem fs;

    @Autowired // <- constructor injection (wouldn't work if `FsCommands` were not a @Component)
    public FsCommands(
            FileSystem fs,
            ApplicationContext ctx, /* manual bean extraction */
            Environment env, /* configuration information */
            ResourceLoader resourceLoader, /* load resources */
            ApplicationEventPublisher publisher, /* send events */
            MessageSource messageSource, /* request translations */
            ApplicationArguments args /* command line arguments */
    ) {
        this.fs = fs;
    }

    @Autowired // <- setter injection
    public void setFs(FileSystem fs) {
        this.fs = fs;
    }

    @ShellMethod("Display required free disk space")
    public long minimumFreeDiskSpace() {
        return 1_000_000;
    }

    @ShellMethod("Convert to lowercase string")
    public String toLowercase(String s) {
        return s.toLowerCase();
    }

    @ShellMethod("Display free disk space")
    public String freeDiskSpace() {
        return DataSize.ofBytes(fs.getFreeDiskSpace()).toGigabytes() + " GB";
    }

}
~~~
