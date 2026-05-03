int greedy(List<Item> items) {
    int answer = initial();
    for (Item item : items) {
        if (forced(item)) answer = take(answer, item);
    }
    return answer;
}
