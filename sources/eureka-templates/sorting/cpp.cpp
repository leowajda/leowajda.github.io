int sortAndScan(std::vector<Item>& items) {
    std::sort(items.begin(), items.end(), order);
    int answer = initial();
    for (const Item& item : items) {
        answer = consume(answer, item);
    }
    return answer;
}
