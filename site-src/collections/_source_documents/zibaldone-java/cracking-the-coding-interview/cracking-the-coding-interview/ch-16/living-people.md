---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: LivingPeople.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/LivingPeople.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/LivingPeople.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/LivingPeople.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_16
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/LivingPeople.java
description: LivingPeople.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

public class LivingPeople {

    private static final int START_YEAR = 1_900;
    private static final int END_YEAR   = 2_000;

    private record Person(int birthYear, int deathYear) { }

    private static int livingPeople(Person[] people) {

        int[] delta = new int[END_YEAR - START_YEAR + 2];
        for (var person : people) {
            delta[person.birthYear - START_YEAR]++;
            delta[person.deathYear - START_YEAR + 1]--;
        }

        int maxYear = 0, maxCount = 0;
        int count = 0;

        for (int year = 0; year < delta.length; year++) {
            count += delta[year];
            if (count > maxCount) {
                maxCount = count;
                maxYear  = year;
            }
        }

        return START_YEAR + maxYear;
    }

}
~~~
