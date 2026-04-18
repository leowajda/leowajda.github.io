---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: StackMin.java
tree_path: src/main/java/cracking_the_coding_interview/ch_03/StackMin.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_03/StackMin.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_03/StackMin.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_03/StackMin.java
description: StackMin.java notes
---

~~~java
package cracking_the_coding_interview.ch_03;

public class StackMin {

    private IntStack stack;
    private IntStack minStack;

    public void push(int val) {
        stack.push(val);
        minStack.push(Math.min(val, min()));
    }

    public int min() {
        return minStack.peek();
    }

    public int peek() {
        return stack.peek();
    }

    public int pop() {
        int val = stack.pop();
        minStack.pop();
        return val;
    }

    public boolean isEmpty() {
        return stack.isEmpty();
    }

}
~~~
