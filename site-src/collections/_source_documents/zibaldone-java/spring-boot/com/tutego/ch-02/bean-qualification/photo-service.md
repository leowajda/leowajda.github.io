---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: PhotoService.java
tree_path: src/main/java/com/tutego/ch_02/beanQualification/PhotoService.java
source_path: spring-boot/src/main/java/com/tutego/ch_02/beanQualification/PhotoService.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_02/beanQualification/PhotoService.java
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
- label: beanQualification
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_02/beanQualification/PhotoService.java
description: PhotoService.java notes
---

~~~java
package com.tutego.ch_02.beanQualification;

import com.tutego.ch_02.beanQualification.thumbnail.AwtNearestNeighborThumbnail;
import com.tutego.ch_02.beanQualification.thumbnail.Thumbnail;
import com.tutego.ch_02.classpathScanning.FileSystem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.io.UncheckedIOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PhotoService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    private final FileSystem fs;

    // @Autowired
    // @Qualifier("fastThumbnailRenderer")                           <- not the optimal solution, too error-prone and tight coupling
    // @ThumbnailRendering(ThumbnailRendering.RenderingQuality.FAST) <- define a custom @Qualifier, only works with @Autowired
    private Thumbnail thumbnail;

    // Optional<T> look-a-like, older than Java 8, bad documentation
    private final ObjectProvider<Thumbnail> thumbnailProvider;

    // Map<String, T> returns all the beans of type T, can also use Set<T>, List<T>, T[]
    public PhotoService(
            FileSystem fs,
            Thumbnail thumbnail,
            Map<String, Thumbnail> thumbnailsMap,
            List<Thumbnail> listThumbnails, /* Sortable data structures can be ordered by the type's Order (annotation or functional interface) */
            ApplicationContext ctx
    ) {
        this.fs = fs;
        this.thumbnail = thumbnail;
        this.thumbnailProvider = ctx != null ? ctx.getBeanProvider(Thumbnail.class) : null;

        if (this.thumbnailProvider != null) {
            // 1. Returns the bean if unique within the application context
            // 2. NoSuchBeanDefinitionException if bean is absent
            // 3. NoUniqueBeanDefinitionException if there are multiple implementations
            this.thumbnail = this.thumbnailProvider.getObject();

            // can define a fallback, but it doesn't scale for complex dependency graphs and defeats the purpose of dependency injection
            this.thumbnail = this.thumbnailProvider.getIfAvailable(AwtNearestNeighborThumbnail::new);
        }

        if (thumbnailsMap != null) {
            thumbnailsMap.values().forEach(impl -> log.info("thumbnail implementation: " + impl.getClass().getName()));
        }
    }

    public Optional<byte[]> download(String name) {
        try {
            return Optional.of(fs.load(name + ".jpg"));
        } catch (UncheckedIOException e) {
            return Optional.empty();
        }
    }


    public String upload(byte[] imageBytes) {
        byte[] thumbnailBytes = thumbnail.thumbnail(imageBytes);

        String imageName = UUID.randomUUID().toString();
        fs.store(imageName + ".jpg", imageBytes);

        log.info("upload");
        fs.store(imageName + "-thumb.jpg", thumbnailBytes);

        return imageName;
    }
}
~~~
