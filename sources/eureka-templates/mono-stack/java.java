int[] nextGreater(int[] values) {
    int[] answer = new int[values.length];
    Arrays.fill(answer, -1);
    ArrayDeque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < values.length; i++) {
        while (!stack.isEmpty() && values[stack.peek()] < values[i]) answer[stack.pop()] = i;
        stack.push(i);
    }
    return answer;
}
