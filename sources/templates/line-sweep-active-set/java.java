void sweepWithActiveSet(List<Event> events) {
    events.sort(this::eventOrder);
    TreeSet<Item> active = new TreeSet<>(this::itemOrder);
    for (Event event : events) {
        if (event.starts) active.add(event.item);
        else active.remove(event.item);
        use(active, event);
    }
}
