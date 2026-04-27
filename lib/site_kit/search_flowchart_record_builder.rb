# frozen_string_literal: true

module SiteKit
  class SearchFlowchartRecordBuilder
    KIND = 'Flowchart'
    PAGE_URL = '/writing/algorithmic-flowchart/'

    def initialize(flowchart:, summaries:, factory:)
      @flowchart = flowchart
      @summaries = summaries
      @factory = factory
    end

    def records
      flowchart.fetch('nodes').map do |node|
        node_record(node, summaries.fetch(node.fetch('id'), {}))
      end
    end

    private

    attr_reader :flowchart, :summaries, :factory

    def node_record(node, summary)
      title = node.fetch('title', node.fetch('label'))

      factory.build(
        kind: KIND,
        title:,
        url: "#{PAGE_URL}##{node.fetch('id')}",
        project: 'Eureka',
        summary: node.fetch('label'),
        content: node_content(node, title, summary),
        filters: { 'flowchart_kind' => node.fetch('kind') },
        meta: { 'target' => node.fetch('id'), 'section' => section_for(node, title) },
        priority: node.fetch('kind') == 'solution' ? 80 : 60
      )
    end

    def node_content(node, title, summary)
      [
        node.fetch('id'),
        node.fetch('kind'),
        node.fetch('label'),
        title,
        ancestor_labels(node),
        summary_text(summary),
        node.fetch('details_html', ''),
        node.fetch('references', []).map { |reference| reference.fetch('title', '') }
      ]
    end

    def summary_text(summary)
      return '' unless summary.is_a?(Hash)

      factory.clean_text(summary.values)
    end

    def section_for(node, title)
      parts = []
      parts << duplicate_context(node) if duplicate_title?(title)
      parts << node.fetch('kind').capitalize
      parts.join(' / ')
    end

    def duplicate_title?(title)
      nodes_by_title.fetch(title, []).size > 1
    end

    def duplicate_context(node)
      duplicates = nodes_by_title.fetch(node_title(node))
      (1..ancestor_labels(node).length).each do |length|
        suffix = ancestor_labels(node).last(length)
        next if suffix.empty?

        duplicate_suffixes = duplicates.map { |candidate| ancestor_labels(candidate).last(length) }
        return suffix.join(' / ') if duplicate_suffixes.count(suffix) == 1
      end

      ancestor_labels(node).last
    end

    def ancestor_labels(node)
      ancestors_for(node).map { |ancestor| context_title(ancestor) }
    end

    def ancestors_for(node)
      ancestors = []
      current = node
      while (edge = incoming_edges_by_target[current.fetch('id')])
        current = nodes_by_id.fetch(edge.fetch('from'))
        ancestors.unshift(current)
      end
      ancestors
    end

    def node_title(node)
      node.fetch('title', node.fetch('label'))
    end

    def context_title(node)
      node.fetch('search_title', node_title(node))
    end

    def nodes_by_title
      @nodes_by_title ||= flowchart.fetch('nodes').group_by { |node| node_title(node) }
    end

    def nodes_by_id
      @nodes_by_id ||= flowchart.fetch('nodes').to_h { |node| [node.fetch('id'), node] }
    end

    def incoming_edges_by_target
      @incoming_edges_by_target ||= flowchart.fetch('edges').to_h do |edge|
        [edge.fetch('to'), edge]
      end
    end
  end
end
