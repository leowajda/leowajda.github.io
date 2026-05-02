int[] prefixTable(String pattern) {
    int[] prefix = new int[pattern.length()];
    for (int i = 1, j = 0; i < pattern.length(); i++) {
        while (j > 0 && pattern.charAt(i) != pattern.charAt(j)) j = prefix[j - 1];
        if (pattern.charAt(i) == pattern.charAt(j)) j++;
        prefix[i] = j;
    }
    return prefix;
}
