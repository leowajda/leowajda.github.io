int sortAndScan(List<Item> items) {
    items.sort(this::order);
    int answer = initial();
    for (Item item : items) {
        answer = consume(answer, item);
    }
    return answer;
}
