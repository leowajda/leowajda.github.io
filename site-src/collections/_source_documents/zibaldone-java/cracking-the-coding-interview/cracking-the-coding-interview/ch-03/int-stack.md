---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: IntStack.java
tree_path: src/main/java/cracking_the_coding_interview/ch_03/IntStack.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_03/IntStack.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_03/IntStack.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_03/IntStack.java
description: IntStack.java notes
---

~~~java
package cracking_the_coding_interview.ch_03;

import java.util.EmptyStackException;

public class IntStack {

    private Node top;
    private int size;

    public IntStack() {
        this.top  = null;
        this.size = 0;
    }

    public void push(int val) {
        size++;

        if (top == null) {
            top = new Node(val);
            return;
        }

        Node prevTop = top;
        top          = new Node(val);
        top.next     = prevTop;
    }

    public int pop() {
        if (isEmpty())
            throw new EmptyStackException();

        size--;
        Node prevTop = top;
        top          = top.next;
        return prevTop.val;
    }

    public int peek() {
        if (isEmpty())
            throw new EmptyStackException();

        return top.val;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public int getSize() {
        return size;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        Node tmp = top;

        sb.append("[");
        while (tmp != null) {
            sb.append(tmp.val);
            if (tmp.next != null) sb.append(",");
            tmp = tmp.next;
        }
        sb.append("]");

        return sb.toString();
    }
}
~~~
