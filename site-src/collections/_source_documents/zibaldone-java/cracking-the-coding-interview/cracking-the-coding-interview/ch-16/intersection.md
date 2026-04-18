---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: Intersection.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/Intersection.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/Intersection.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/Intersection.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/Intersection.java
description: Intersection.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

public class Intersection {

    private record Point(double x, double y) {

        public boolean isBetween(Point start, Point end) {
            return start.x <= this.x && this.x <= end.x &&
                   start.y <= this.y && this.y <= end.y;
        }

        public boolean isBetween(Line line) {
            return isBetween(line.start, line.end);
        }
    }

    private record Line(Point start, Point end) {

        private double deltaOfX() {
            return end.x - start.x;
        }

        private double deltaOfY() {
            return end.y - start.y;
        }

        // y = mx + b
        public double m() {
            assert deltaOfX() != 0;
            return deltaOfY() / deltaOfX();
        }

        public double b() {
            return end.y - m() * end.x;
        }

        public boolean isBetween(Point point) {
            return point.isBetween(start, end);
        }

    }

    private static Point intersection(Point startA, Point endA, Point startB, Point endB) {
        assert startA.x >= endA.x && startB.x >= endB.x && startA.x >= startB.x;

        Line lineA = new Line(startA, endB), lineB = new Line(startB, endB);

        // if lines are parallel to each other, they can only intersect when they have the same offset and a common segment
        if (lineA.m() == lineB.m())
            return lineA.b() == lineB.b() && lineA.isBetween(lineB.start) ? lineB.start : null;

        // m1 * x + b1 = m2 * x + b2
        // m1 * x - m2 * x + b1 = b2
        // x(m1 - m2) = b2 - b1
        // x = (b2 - b1) / (m1 - m2)
        double intersectionX = (lineB.b() - lineA.b()) / (lineA.m() - lineB.m());
        // y = m ((b2 - b1) / (m1 - m2)) + b
        double intersectionY = intersectionX * lineA.m() + lineA.b();
        Point intersectionPoint = new Point(intersectionX, intersectionY);

        return intersectionPoint.isBetween(lineA) && intersectionPoint.isBetween(lineB) ? intersectionPoint : null;
    }

}
~~~
