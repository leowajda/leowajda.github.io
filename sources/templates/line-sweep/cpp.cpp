int sweep(std::vector<Event> events) {
    std::sort(events.begin(), events.end(), eventOrder);
    int active = 0, answer = initial();
    for (const Event& event : events) {
        active += event.delta;
        answer = update(answer, event, active);
    }
    return answer;
}
