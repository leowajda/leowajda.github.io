int greedyAfterSort(std::vector<Item>& items) {
    std::sort(items.begin(), items.end(), priority);
    int answer = initial();
    for (const Item& item : items) {
        if (compatible(item)) answer = take(answer, item);
    }
    return answer;
}
