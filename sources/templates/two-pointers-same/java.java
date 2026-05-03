int compact(int[] values) {
    int write = 0;
    for (int read = 0; read < values.length; read++) {
        if (keep(values[read])) values[write++] = transform(values[read]);
    }
    return write;
}
