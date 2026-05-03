def next_greater(values: list[int]) -> list[int]:
    answer = [-1] * len(values)
    stack = []
    for i, value in enumerate(values):
        while stack and values[stack[-1]] < value:
            answer[stack.pop()] = i
        stack.append(i)
    return answer
