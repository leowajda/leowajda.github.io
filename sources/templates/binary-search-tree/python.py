def contains(node, target: int) -> bool:
    while node:
        if node.value == target:
            return True
        node = node.left if target < node.value else node.right
    return False
