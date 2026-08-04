# frozen_string_literal: true

module SiteKit
  module Extras
    # Hash-target Pagefind records (templates + flowchart nodes only).
    module Pagefind # rubocop:disable Metrics/ModuleLength
      module_function

      LANGUAGE = 'en'
      MAX_CONTENT_LENGTH = 8_000

      def records(template_guide:, flowchart:, flowchart_summaries: {})
        template_records(template_guide) + flowchart_records(flowchart, flowchart_summaries)
      end

      def template_records(guide)
        guide.fetch('patterns').flat_map do |pattern|
          [pattern_record(pattern), *variant_records(pattern)]
        end
      end

      def flowchart_records(flowchart, summaries)
        index = SiteKit::Compile::Flowchart::GraphIndex.new(flowchart: flowchart)
        nodes_by_title = flowchart.fetch('nodes').group_by { |node| node.fetch('text') }

        index.node_by_id.values.map do |node|
          flowchart_node_record(node, summaries.fetch(node.fetch('id'), {}), index, nodes_by_title)
        end
      end

      def pattern_record(pattern)
        build_record(
          kind: 'Template',
          title: pattern.fetch('label'),
          url: "#{SiteKit::TEMPLATES_URL}##{pattern.fetch('target')}",
          summary: pattern.fetch('description'),
          content: [
            pattern.fetch('label'),
            pattern.fetch('description'),
            pattern.fetch('variants').map { |variant| variant.fetch('label') },
            pattern.fetch('variants').flat_map { |variant| variant.fetch('aliases', []) }
          ],
          filters: { 'template' => pattern.fetch('label') },
          meta: {
            'target' => pattern.fetch('target'),
            'pattern' => pattern.fetch('id'),
            'section' => 'Pattern'
          },
          priority: 85
        )
      end

      def variant_records(pattern)
        pattern.fetch('variants').select { |variant| variant.fetch('has_template') }.map do |variant|
          title = reference_label(pattern, variant)
          build_record(
            kind: 'Template',
            title: title,
            url: "#{SiteKit::TEMPLATES_URL}##{variant.fetch('target')}",
            summary: variant.fetch('signal', ''),
            content: [
              title,
              pattern.fetch('description'),
              variant.fetch('description', ''),
              variant.fetch('signal', ''),
              variant.fetch('aliases', []),
              variant.fetch('target'),
              variant.dig('template', 'title'),
              variant.dig('template', 'description')
            ],
            filters: { 'template' => [pattern.fetch('label'), title] },
            meta: {
              'target' => variant.fetch('target'),
              'pattern' => pattern.fetch('id'),
              'section' => pattern.fetch('label')
            },
            priority: 95
          )
        end
      end

      def flowchart_node_record(node, summary, index, nodes_by_title)
        title = node.fetch('text')
        ancestors = ancestor_nodes(node, index)
        ancestor_labels = ancestors.map { |ancestor| ancestor.fetch('search_title', ancestor.fetch('text')) }

        build_record(
          kind: 'Flowchart',
          title: title,
          url: "#{SiteKit::FLOWCHART_URL}##{node.fetch('id')}",
          summary: title,
          content: [
            node.fetch('id'),
            node.fetch('aliases', []),
            node.fetch('kind'),
            title,
            node.fetch('canvas_text'),
            node.fetch('search_title'),
            ancestor_labels,
            summary_text(summary),
            node.fetch('references', []).map { |reference| reference.fetch('title', '') }
          ],
          filters: { 'flowchart_kind' => node.fetch('kind') },
          meta: {
            'target' => node.fetch('id'),
            'section' => flowchart_section(node, title, ancestor_labels, nodes_by_title, index)
          },
          priority: node.fetch('kind') == 'solution' ? 80 : 60
        )
      end

      def build_record(kind:, title:, url:, content:, summary: '', filters: {}, meta: {}, priority: 50) # rubocop:disable Metrics/ParameterLists
        SiteKit::Search::Record.new(
          url: normalized_url(url),
          content: truncate_content(clean_text([title, summary, content])),
          language: LANGUAGE,
          meta: compact_text_hash(
            {
              'title' => title,
              'kind' => kind,
              'project' => 'Eureka',
              'summary' => summary.to_s
            }.merge(meta)
          ),
          filters: normalize_filters({ 'kind' => kind, 'project' => 'Eureka' }.merge(filters)),
          sort: { 'priority' => priority.to_s }
        ).validate!
      end

      def reference_label(pattern, variant = nil)
        parts = [pattern.fetch('label').to_s.strip]
        parts << variant.fetch('label').to_s.strip if variant
        parts.reject(&:empty?).join(' ')
      end

      def clean_text(value)
        Array(value).flatten.join(' ').gsub(/\s+/, ' ').strip
      end

      def summary_text(summary)
        return '' unless summary.is_a?(Hash)

        clean_text(summary.values)
      end

      def truncate_content(content)
        return content if content.length <= MAX_CONTENT_LENGTH

        content[0, MAX_CONTENT_LENGTH].strip
      end

      def normalize_filters(filters)
        filters.each_with_object({}) do |(key, value), result|
          values = Array(value).flatten.map { |entry| clean_text(entry) }.reject(&:empty?).uniq
          result[key] = values unless values.empty?
        end
      end

      def compact_text_hash(hash)
        SiteKit::Core::RecordHelpers.compact_hash(hash.transform_values { |value| clean_text(value) })
      end

      def normalized_url(url)
        url = url.to_s
        return url if url.start_with?('/', 'https://', 'http://')

        "/#{url}"
      end

      def ancestor_nodes(node, index)
        ancestors = []
        current = node
        while (edge = index.incoming_edges_by_target[current.fetch('id')])
          current = index.node_by_id.fetch(edge.fetch('from'))
          ancestors.unshift(current)
        end
        ancestors
      end

      def flowchart_section(node, title, ancestor_labels, nodes_by_title, index)
        parts = []
        if nodes_by_title.fetch(title, []).size > 1
          parts << duplicate_context(node, ancestor_labels, nodes_by_title, index)
        end
        parts << node.fetch('kind').capitalize
        parts.join(' / ')
      end

      def duplicate_context(node, ancestor_labels, nodes_by_title, index)
        duplicates = nodes_by_title.fetch(node.fetch('text'))
        duplicate_ancestor_labels = duplicates.map do |candidate|
          ancestor_nodes(candidate, index).map { |ancestor| ancestor.fetch('search_title', ancestor.fetch('text')) }
        end

        (1..ancestor_labels.length).each do |length|
          suffix = ancestor_labels.last(length)
          next if suffix.empty?

          return suffix.join(' / ') if duplicate_ancestor_labels.one? { |labels| labels.last(length) == suffix }
        end

        ancestor_labels.last.to_s
      end
    end
  end
end
