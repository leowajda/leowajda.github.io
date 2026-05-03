def serialize(node, out: list[str]) -> None:
    if not node:
        out.append("#")
        return
    out.append(str(node.value))
    serialize(node.left, out)
    serialize(node.right, out)
