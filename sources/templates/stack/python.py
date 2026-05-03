def parse(tokens) -> None:
    stack = []
    for token in tokens:
        if opens(token):
            stack.append(token)
        else:
            resolve(stack.pop(), token)
