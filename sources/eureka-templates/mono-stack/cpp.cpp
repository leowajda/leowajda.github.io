std::vector<int> nextGreater(const std::vector<int>& values) {
    std::vector<int> answer(values.size(), -1);
    std::vector<int> stack;
    for (int i = 0; i < values.size(); i++) {
        while (!stack.empty() && values[stack.back()] < values[i]) {
            answer[stack.back()] = i;
            stack.pop_back();
        }
        stack.push_back(i);
    }
    return answer;
}
