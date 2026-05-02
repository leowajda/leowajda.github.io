void sweepWithActiveSet(std::vector<Event> events) {
    std::sort(events.begin(), events.end(), eventOrder);
    std::set<Item, ItemOrder> active;
    for (const Event& event : events) {
        if (event.starts) active.insert(event.item);
        else active.erase(event.item);
        use(active, event);
    }
}
