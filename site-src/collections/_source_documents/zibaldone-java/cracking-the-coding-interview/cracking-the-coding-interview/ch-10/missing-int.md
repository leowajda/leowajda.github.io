---
project_slug: zibaldone-java
module_slug: cracking-the-coding-interview
module_title: Cracking The Coding Interview
title: MissingInt.java
tree_path: src/main/java/cracking_the_coding_interview/ch_10/MissingInt.java
source_path: cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/MissingInt.java
source_url: https://github.com/leowajda/zibaldone-java/blob/master/cracking-the-coding-interview/src/main/java/cracking_the_coding_interview/ch_10/MissingInt.java
language: java
format: code
breadcrumbs:
- label: Zibaldone Java
  url: "/zibaldone-java/"
- label: Cracking The Coding Interview
  url: "/zibaldone-java/cracking-the-coding-interview/"
- label: cracking_the_coding_interview
  url: ''
- label: ch_10
  url: ''
document_id: cracking-the-coding-interview:src/main/java/cracking_the_coding_interview/ch_10/MissingInt.java
description: MissingInt.java notes
---

~~~java
package cracking_the_coding_interview.ch_10;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.Scanner;
import java.util.stream.IntStream;

public class MissingInt {

    private static final int RANGE_SIZE = (1 << 20);

    private static int missingInt(String fileName) throws FileNotFoundException {
        int[] blocks    = firstPass(fileName);
        int blockOffset = IntStream.range(0, blocks.length)
                .filter(idx -> blocks[idx] < RANGE_SIZE)
                .findFirst()
                .orElse(-1);

        if (blockOffset == -1) return blockOffset;

        byte[] vector   = secondPass(fileName, blockOffset);
        int byteOffset  = IntStream.range(0, vector.length)
                .filter(idx -> blocks[idx] != ~0)
                .findFirst()
                .orElse(-1);

        if (byteOffset == -1) return byteOffset;

        int bitOffset = thirdPass(vector[byteOffset]);
        return blockOffset * RANGE_SIZE + (byteOffset * Byte.SIZE + bitOffset);
    }

    private static int[] firstPass(String fileName) throws FileNotFoundException {
        int blockSize = (Integer.MAX_VALUE / RANGE_SIZE) + 1;
        int[] blocks  = new int[blockSize];

        try (var in = new Scanner(new FileReader(fileName))) {
            int num = in.nextInt();
            blocks[num / RANGE_SIZE]++;
        }

        return blocks;
    }

    private static byte[] secondPass(String fileName, int offset) throws FileNotFoundException {

        byte[] vector  = new byte[RANGE_SIZE / Byte.SIZE];
        int startRange = offset * RANGE_SIZE;
        int endRange   = startRange + RANGE_SIZE;

        try (var in = new Scanner(new FileReader(fileName))) {
            int num = in.nextInt();
            if (startRange <= num && num <= endRange) {
                int diff = num - startRange;
                vector[diff / Byte.SIZE] |= (1 << (diff % Byte.SIZE));
            }
        }

        return vector;
    }

    private static int thirdPass(byte byteWithZero) {

        for (int bitPos = 0; bitPos < Byte.SIZE; bitPos++)
            if ((byteWithZero & (1 << (bitPos))) == 0)
                return bitPos;

        throw new IllegalStateException();
    }

}
~~~
