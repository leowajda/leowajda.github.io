def sweep_with_active_set(events) -> None:
    active = OrderedSet()
    for event in sorted(events, key=event_order):
        if event.starts:
            active.add(event.item)
        else:
            active.remove(event.item)
        use(active, event)
