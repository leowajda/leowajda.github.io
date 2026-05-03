final class Trie:
  val next = scala.collection.mutable.Map[Char, Trie]()
  var word = false

  def add(text: String): Unit =
    var node = this
    for ch <- text do node = node.next.getOrElseUpdate(ch, new Trie)
    node.word = true
