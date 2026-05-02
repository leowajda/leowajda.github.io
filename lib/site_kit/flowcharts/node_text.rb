# frozen_string_literal: true

module SiteKit
  module Flowcharts
    module NodeText
      GENERATED_TEXT_KEYS = %w[canvas_text].freeze
      LEGACY_TEXT_KEYS = %w[label title].freeze

      module_function

      def validate_source!(node)
        validate_no_generated_text!(node)
        validate_no_legacy_text!(node)
        validate_copy!(node)
      end

      def text(node)
        node_id = node.fetch('id', '(unknown)')
        value = SiteKit::Core::Helpers.ensure_string(node.fetch('text'), "Flowchart node #{node_id}.text").strip
        raise SiteKit::CatalogError, "Flowchart node '#{node_id}' text must not be empty" if value.empty?

        value
      end

      def canvas_text(node)
        node_id = node.fetch('id', '(unknown)')
        value = SiteKit::Core::Helpers.ensure_string(node.fetch('short_text', text(node)),
                                                     "Flowchart node #{node_id}.short_text").strip
        raise SiteKit::CatalogError, "Flowchart node '#{node_id}' short_text must not be empty" if value.empty?

        value
      end

      def search_title(node)
        node_id = node.fetch('id', '(unknown)')
        value = SiteKit::Core::Helpers.ensure_string(node.fetch('search_title', text(node)),
                                                     "Flowchart node #{node_id}.search_title").strip
        raise SiteKit::CatalogError, "Flowchart node '#{node_id}' search_title must not be empty" if value.empty?

        value
      end

      def validate_no_generated_text!(node)
        generated_keys = GENERATED_TEXT_KEYS & node.keys
        return if generated_keys.empty?

        raise SiteKit::CatalogError,
              "Flowchart node '#{node.fetch('id', '(unknown)')}' defines generated text fields: " \
              "#{generated_keys.join(', ')}"
      end

      def validate_no_legacy_text!(node)
        legacy_text_keys = LEGACY_TEXT_KEYS & node.keys
        return if legacy_text_keys.empty?

        raise SiteKit::CatalogError,
              "Flowchart node '#{node.fetch('id', '(unknown)')}' uses legacy text keys: " \
              "#{legacy_text_keys.join(', ')}"
      end

      def validate_copy!(node)
        node_id = node.fetch('id', '(unknown)')
        kind = SiteKit::Core::Helpers.ensure_string(node.fetch('kind'), "Flowchart node #{node_id}.kind")
        value = text(node)

        case kind
        when 'decision'
          unless value.end_with?('?')
            raise SiteKit::CatalogError,
                  "Flowchart decision '#{node_id}' text must be phrased as a question"
          end
        when 'solution'
          if value.end_with?('?')
            raise SiteKit::CatalogError,
                  "Flowchart solution '#{node_id}' text must not be phrased as a question"
          end
        else
          raise SiteKit::CatalogError, "Flowchart node '#{node_id}' has unknown kind '#{kind}'"
        end
      end
    end
  end
end
