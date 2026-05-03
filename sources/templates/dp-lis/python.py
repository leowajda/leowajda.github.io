def increasing_subsequence_length(values: list[int]) -> int:
    tails = []
    for value in values:
        i = lower_bound(tails, value)
        if i == len(tails):
            tails.append(value)
        else:
            tails[i] = value
    return len(tails)
