---
project_slug: zibaldone-java
module_slug: spring-boot
module_title: Spring Boot
title: AppRestController.java
tree_path: src/main/java/com/tutego/ch_09/mappers/AppRestController.java
source_path: spring-boot/src/main/java/com/tutego/ch_09/mappers/AppRestController.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/spring-boot/src/main/java/com/tutego/ch_09/mappers/AppRestController.java
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
- label: mappers
  url: ''
document_id: spring-boot:src/main/java/com/tutego/ch_09/mappers/AppRestController.java
description: AppRestController.java notes
---

~~~java
package com.tutego.ch_09.mappers;

import com.tutego.ch_07.ProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Stream;

@RestController // shorthand for @Controller + @ResponseBody
@RequestMapping("/api") // can also be used at class level (confusing)
public class AppRestController {

    private final ProfileRepository profileRepository;

    public AppRestController(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @GetMapping("/total") // == @RequestMapping(path = "/api/stat/total", method = RequestMethod.GET)
    public String totalNumberOfRegisteredUnicorns() {
        return String.valueOf(profileRepository.count());
    }

    @GetMapping("/last-seen")
    public ResponseEntity<LastSeenStatistics> lastSeenStatistics() {
        var start = YearMonth.now().minusYears(2);
        var end = YearMonth.now();
        var rnd = ThreadLocalRandom.current();
        var data = Stream.iterate(start, o -> o.plusMonths(1))
                .limit(start.until(end, ChronoUnit.MONTHS) + 1)
                .map(yearMonth -> new LastSeenStatistics.Data(yearMonth, rnd.nextInt(1000, 10000)))
                .toList();

        return ResponseEntity.ok(new LastSeenStatistics(data));
    }

    @RequestMapping("/test")
    public void handleRequest(HttpServletRequest in, HttpServletResponse out) {
        var requestUri = in.getRequestURI();
        var requestUrl = in.getRequestURL();
        var servletPath = in.getServletPath();
    }

    @GetMapping("/profile/search" /* ?q=fillmore */)
    public String requestParams(
            @RequestParam("q") String query,
            @RequestParam("page" /* can also specify a default value or mark the field as not required */) Optional<String> page,
            @RequestParam MultiValueMap<String, String> params // MultiValueMap<?, ?> is needed for q=fillmore&q=bold
    ) {
        return query;
    }

    @GetMapping("/profiles/{id}/photos/{index}")
    public String pathVariables(
            @PathVariable("id") long profileId,
            @PathVariable("index") int index
    ) {
        return String.valueOf(profileId);
    }

    @GetMapping("headers")
    public String handlerMethod(
            @RequestHeader("Accept-Language") String acceptLanguage,
            @RequestHeader(value = "User-Agent", defaultValue = "Bro") String userAgent,
            @RequestHeader("Keep-Alive") long keepAlive,
            @RequestHeader HttpHeaders allHttpHeaders
    ) {
        return acceptLanguage;
    }

    @GetMapping("/{name:[-\\w]+}.{suffix:\\w+}") // URI template pattern with regular expressions
    public void custom(
            @DateTimeFormat(pattern = "MM-dd-yyy") LocalDate date, // ConversionService only works with ISO-8601
            @ModelAttribute YearMonthRange range, // built by WebDataBinder, binds only request params
            BindingResult bindingResult, // binding the results avoids the handler throwing an exception (??)
            @RequestParam YearMonthRange anotherRange, // ?range=2024-01~2024-12 built through the Formatter<YearMonthRange>
            @PathVariable String name,
            @PathVariable String suffix
    ) {}
}
~~~
