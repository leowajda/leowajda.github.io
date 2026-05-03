def sieve(n: int) -> list[bool]:
    prime = [True] * (n + 1)
    if n >= 0:
        prime[0] = False
    if n >= 1:
        prime[1] = False
    p = 2
    while p * p <= n:
        if prime[p]:
            for x in range(p * p, n + 1, p):
                prime[x] = False
        p += 1
    return prime
