---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: AnimalShelter.java
tree_path: src/main/java/cracking_the_coding_interview/ch_03/AnimalShelter.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_03/AnimalShelter.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_03/AnimalShelter.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_03
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_03/AnimalShelter.java
description: AnimalShelter.java notes
---

~~~java
package cracking_the_coding_interview.ch_03;

import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.NoSuchElementException;

public class AnimalShelter {

    private sealed abstract class Animal permits Dog, Cat {
         public Instant arrivalTime;

         public final void setArrivalTime() {
            this.arrivalTime = Instant.now();
        }
    }

    private final class Dog extends Animal { }
    private final class Cat extends Animal { }

    private final List<Dog> dogQueue;
    private final List<Cat> catQueue;

    public AnimalShelter() {
        this.dogQueue = new LinkedList<>();
        this.catQueue = new LinkedList<>();
    }

    public void enqueue(Animal animal) {
        // mutability is necessary if the arrival time differs from the initialization time
        animal.setArrivalTime();

        switch (animal) {
            case Cat cat -> catQueue.addLast(cat);
            case Dog dog -> dogQueue.addLast(dog);
            default      -> throw new IllegalStateException("Unexpected value: " + animal);
        }
    }

    public Animal dequeueAny() {

        if (dogQueue.isEmpty() && catQueue.isEmpty()) throw new NoSuchElementException();
        if (dogQueue.isEmpty())                       return dequeueCat();
        if (catQueue.isEmpty())                       return dequeueDog();

        Animal oldestDog = dogQueue.getFirst(), oldestCat = catQueue.getFirst();
        return oldestDog.arrivalTime.isBefore(oldestCat.arrivalTime) ? dequeueDog() : dequeueCat();
    }

    public Dog dequeueDog() {
        return dogQueue.removeFirst();
    }

    public Cat dequeueCat() {
        return catQueue.removeFirst();
    }
}
~~~
