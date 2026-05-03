int greedy(const std::vector<Item>& items) {
    int answer = initial();
    for (const Item& item : items) {
        if (forced(item)) answer = take(answer, item);
    }
    return answer;
}
