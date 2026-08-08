# frozen_string_literal: true

module SiteKit
  module SourceNotes
    class TreeBuilder
      def self.build(root_label:, entries:)
        new(root_label:, entries:).build
      end

      def initialize(root_label:, entries:)
        @root_label = root_label
        @entries = entries
      end

      def build
        root = entries.each_with_object([]) do |entry, nodes|
          insert(nodes, entry)
        end
        annotate(sort_nodes(root))
      end

      private

      attr_reader :root_label, :entries

      def insert(root, entry)
        segments = entry.fetch(:relative_path).split('/').reject(&:empty?)
        cursor = root

        segments.each_with_index do |segment, index|
          tree_path = "#{root_label}/#{segments[0..index].join('/')}"
          leaf = index == segments.length - 1
          node = cursor.find do |candidate|
            candidate.fetch('title') == segment && candidate.fetch('tree_path') == tree_path
          end
          unless node
            node = {
              'kind' => leaf ? 'file' : 'directory',
              'title' => segment,
              'tree_path' => tree_path,
              'url' => leaf ? entry.fetch(:url) : '',
              'url_prefix' => '',
              'children' => []
            }
            cursor << node
          end
          cursor = node.fetch('children')
        end
      end

      def sort_nodes(nodes)
        nodes
          .sort_by { |node| [node.fetch('kind') == 'directory' ? 0 : 1, node.fetch('title').downcase] }
          .map { |node| node.merge('children' => sort_nodes(node.fetch('children'))) }
      end

      def annotate(nodes)
        nodes.each do |node|
          children = annotate(node.fetch('children'))
          node['children'] = children
          if node.fetch('kind') == 'directory'
            urls = descendant_urls(node)
            node['url_prefix'] = common_prefix(urls)
          end
        end
        nodes
      end

      def descendant_urls(node)
        if node.fetch('kind') == 'file'
          url = node.fetch('url')
          return url.empty? ? [] : [url]
        end

        node.fetch('children').flat_map { |child| descendant_urls(child) }
      end

      def common_prefix(urls)
        return '' if urls.empty?

        parts = urls.map { |url| url.split('/').reject(&:empty?) }
        shared = parts.first.take_while.with_index do |segment, index|
          parts.all? { |candidate| candidate[index] == segment }
        end
        return '' if shared.empty?

        "/#{shared.join('/')}/"
      end
    end
  end
end
