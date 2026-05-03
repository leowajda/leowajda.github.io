void parse(List<Token> tokens) {
    ArrayDeque<Token> stack = new ArrayDeque<>();
    for (Token token : tokens) {
        if (opens(token)) stack.push(token);
        else resolve(stack.pop(), token);
    }
}
