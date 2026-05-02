void parse(const std::vector<Token>& tokens) {
    std::vector<Token> stack;
    for (const Token& token : tokens) {
        if (opens(token)) stack.push_back(token);
        else {
            resolve(stack.back(), token);
            stack.pop_back();
        }
    }
}
