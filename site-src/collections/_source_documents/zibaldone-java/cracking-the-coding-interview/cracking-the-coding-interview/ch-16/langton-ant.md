---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: LangtonAnt.java
tree_path: src/main/java/cracking_the_coding_interview/ch_16/LangtonAnt.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/LangtonAnt.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_16/LangtonAnt.java
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
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_16/LangtonAnt.java
description: LangtonAnt.java notes
---

~~~java
package cracking_the_coding_interview.ch_16;

import java.util.HashSet;
import java.util.Set;

public class LangtonAnt {

    private enum Direction {
        NORTH, SOUTH, EAST, WEST;

        public Direction flip(boolean isClockWise) {
            return switch (this) {
                case NORTH -> isClockWise ? EAST : WEST;
                case SOUTH -> isClockWise ? WEST : EAST;
                case EAST  -> isClockWise ? SOUTH : NORTH;
                case WEST  -> isClockWise ? NORTH : SOUTH;
            };
        }
    }

    private static class Position {
        int row, col;

        public Position(int row, int col) {
            this.row = row;
            this.col = col;
        }

        public Position copy() {
            return new Position(this.row, this.col);
        }

        @Override
        public int hashCode() {
            return (row * 31) ^ col;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Position position = (Position) o;
            return row == position.row && col == position.col;
        }
    }

    private static class Ant {

        Position pos;
        Direction dir;

        public Ant() {
            this.pos = new Position(0, 0);
            this.dir = Direction.EAST;
        }

        public void changeDirection(boolean isClockWise) {
            dir = dir.flip(isClockWise);
        }

        public void moveForward() {
            switch (dir) {
                case NORTH -> pos.row++;
                case SOUTH -> pos.row--;
                case EAST  -> pos.col++;
                case WEST  -> pos.col--;
            }
        }

    }

    private static class Board {

        Position minPos, maxPos;
        Set<Position> blackPos;
        Ant ant;

        public Board() {
            this.minPos     = new Position(0, 0);
            this.maxPos     = new Position(0, 0);
            this.blackPos   = new HashSet<>();
            this.ant        = new Ant();
        }

        public void move() {
            flipCellColor(ant.pos);                             // 1. flip color
            ant.changeDirection(!blackPos.contains(ant.pos));   // 2. change dir
            ant.moveForward();                                  // 3. move forward

            minPos.row = Math.min(minPos.row, ant.pos.row);
            minPos.col = Math.min(minPos.col, ant.pos.col);
            maxPos.row = Math.max(maxPos.row, ant.pos.row);
            maxPos.col = Math.max(maxPos.col, ant.pos.col);
        }

        private void flipCellColor(Position pos) {
            if (blackPos.contains(pos)) blackPos.remove(pos);
            else                        blackPos.add(pos.copy());
        }


        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            for (int row = minPos.row; row <= maxPos.row; row++) {
                for (int col = minPos.col; col <= maxPos.col; col++) {
                    if (row == ant.pos.row && col == ant.pos.col) {
                        sb.append("A");
                        continue;
                    }

                    var pos = new Position(row, col);
                    sb.append(blackPos.contains(pos) ? "X" : "-");
                }
                sb.append("\n");
            }

            return sb.toString();
        }
    }

}
~~~
