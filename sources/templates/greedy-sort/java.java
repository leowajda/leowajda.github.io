int greedyAfterSort(List<Item> items) {
    items.sort(this::priority);
    int answer = initial();
    for (Item item : items) {
        if (compatible(item)) answer = take(answer, item);
    }
    return answer;
}
