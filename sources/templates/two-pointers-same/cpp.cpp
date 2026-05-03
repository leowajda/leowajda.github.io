int compact(std::vector<int>& values) {
    int write = 0;
    for (int read = 0; read < values.size(); read++) {
        if (keep(values[read])) values[write++] = transform(values[read]);
    }
    return write;
}
