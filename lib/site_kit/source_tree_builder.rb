# frozen_string_literal: true

module SiteKit
  class SourceTreeBuilder
    def self.build(root_label:, entries:)
      new(root_label:, entries:).build
    end

    def initialize(root_label:, entries:)
      @root_label = root_label
      @entries = entries
    end

    def build
      entries.each_with_object([]) do |entry, root|
        insert(root, entry)
      end.then { |root| sort_nodes(root) }
    end

    private

    attr_reader :root_label, :entries

    def insert(root, entry)
      segments = entry.fetch(:relative_path).split("/").reject(&:empty?)
      cursor = root

      segments.each_with_index do |segment, index|
        tree_path = "#{root_label}/#{segments[0..index].join('/')}"
        node = cursor.find { |candidate| candidate.fetch("title") == segment && candidate.fetch("tree_path") == tree_path }
        unless node
          node = {
            "kind" => index == segments.length - 1 ? "file" : "directory",
            "title" => segment,
            "tree_path" => tree_path,
            "url" => index == segments.length - 1 ? entry.fetch(:url) : "",
            "children" => []
          }
          cursor << node
        end
        cursor = node.fetch("children")
      end
    end

    def sort_nodes(nodes)
      nodes
        .sort_by { |node| [node.fetch("kind") == "directory" ? 0 : 1, node.fetch("title").downcase] }
        .map { |node| node.merge("children" => sort_nodes(node.fetch("children"))) }
    end
  end
end
