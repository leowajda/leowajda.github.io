---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: QueueViaStacks.java
tree_path: src/main/java/cracking_the_coding_interview/ch_03/QueueViaStacks.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_03/QueueViaStacks.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_03/QueueViaStacks.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_03/QueueViaStacks.java
description: QueueViaStacks.java notes
---

~~~java
package cracking_the_coding_interview.ch_03;

import java.util.EmptyStackException;

public class QueueViaStacks {

    private final IntStack stack, reverseStack;

    public QueueViaStacks() {
        this.stack        = new IntStack();
        this.reverseStack = new IntStack();
    }

    public void add(int value) {
        stack.push(value);
    }

    public int remove() {
        if (isEmpty())
            throw new EmptyStackException();

        if (!reverseStack.isEmpty())
            return reverseStack.pop();

        flipStacks();
        return reverseStack.pop();
    }

    public int peek() {
        if (isEmpty())
            throw new EmptyStackException();

        if (!reverseStack.isEmpty())
            return reverseStack.peek();

        flipStacks();
        return reverseStack.peek();
    }

    public boolean isEmpty() {
        return size() == 0;
    }

    public int size() {
        return stack.getSize() + reverseStack.getSize();
    }

    private void flipStacks() {
        while (!stack.isEmpty())
            reverseStack.push(stack.pop());
    }

}
~~~
