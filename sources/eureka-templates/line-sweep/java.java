int sweep(List<Event> events) {
    events.sort(this::eventOrder);
    int active = 0;
    int answer = initial();
    for (Event event : events) {
        active += event.delta;
        answer = update(answer, event, active);
    }
    return answer;
}
